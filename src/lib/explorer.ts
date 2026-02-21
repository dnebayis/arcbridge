import { CHAIN_CONFIG, arcTestnet } from "./chains";
import { formatUSDC } from "./bridge";
import { sepolia } from "wagmi/chains";
import type { SupportedChainId } from "./chains";

const ARCSCAN_API = "https://testnet.arcscan.app/api";
const ETHERSCAN_API = "https://api.etherscan.io/v2/api";
const IRIS_API = "https://iris-api-sandbox.circle.com";

const TOKEN_MESSENGER = "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa";
const MESSAGE_TRANSMITTER = "0xe737e5cebeeba77efe34d4aa090756590b1ce275";

const DEPOSIT_SELECTORS = new Set(["0x6fd3504e", "0x8e0250ee", "0x779b432d"]);
const RECEIVE_MESSAGE_SELECTOR = "0x57ecfd28";

// ────────────────────────────────────────────────────────────────────────────
// localStorage — bu dapp'ten yapılan burn hash'lerini sakla
// ────────────────────────────────────────────────────────────────────────────
const DAPP_BURNS_KEY = "arc_bridge_burns";

export function saveBurnTxHash(hash: string): void {
  if (typeof window === "undefined") return;
  const existing = getDappBurnHashes();
  if (!existing.includes(hash.toLowerCase())) {
    existing.unshift(hash.toLowerCase());
    localStorage.setItem(DAPP_BURNS_KEY, JSON.stringify(existing.slice(0, 100)));
  }
}

export function getDappBurnHashes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DAPP_BURNS_KEY) || "[]");
  } catch {
    return [];
  }
}

export interface ExplorerTx {
  hash: string;
  from: string;
  to: string;
  input: string;
  timeStamp: string;
  isError: string;
  blockNumber: string;
}

export interface CCTPBridgeTx {
  burnTxHash: string;
  mintTxHash?: string;
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
  recipient: string;
  timestamp: number;
  // pending   = Iris'te henüz yok
  // claimable = Attestation hazır, mint edilmemiş
  // complete  = mint edildi
  // failed    = burn başarısız
  status: "pending" | "claimable" | "complete" | "failed";
  burnExplorerUrl: string;
  mintExplorerUrl?: string;
  destinationDomain: number;
  irisMessage?: string;
  irisAttestation?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Explorer fetch — cüzdanın kendi tx'leri
// ────────────────────────────────────────────────────────────────────────────

async function fetchWalletTxs(
  walletAddress: string,
  api: "arc" | "sepolia",
  etherscanApiKey?: string
): Promise<ExplorerTx[]> {
  const params: Record<string, string> = {
    module: "account",
    action: "txlist",
    address: walletAddress,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: "500",
    sort: "desc",
  };

  if (api === "arc") {
    const url = new URL(ARCSCAN_API);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`ArcScan error: ${res.status}`);
    const data = await res.json();
    if (data.status === "0") {
      if (data.message === "No transactions found") return [];
      throw new Error(`ArcScan: ${data.message}`);
    }
    return data.result as ExplorerTx[];
  } else {
    const url = new URL(ETHERSCAN_API);
    url.searchParams.set("chainid", "11155111");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (etherscanApiKey) url.searchParams.set("apikey", etherscanApiKey);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Etherscan error: ${res.status}`);
    const data = await res.json();
    if (data.status === "0") {
      if (data.message === "No transactions found") return [];
      if (typeof data.result === "string" && data.result.includes("API Key")) return [];
      throw new Error(`Etherscan: ${data.message}`);
    }
    return data.result as ExplorerTx[];
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Calldata decoder — tüm depositForBurn varyantları
// ────────────────────────────────────────────────────────────────────────────
function decodeDepositForBurn(input: string): {
  amount: bigint;
  destinationDomain: number;
  mintRecipient: string;
} | null {
  try {
    const data = input.slice(10);
    if (data.length < 3 * 64) return null;
    return {
      amount: BigInt("0x" + data.slice(0, 64)),
      destinationDomain: parseInt(data.slice(64, 128), 16),
      mintRecipient: "0x" + data.slice(128, 192).slice(-40),
    };
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Iris API
// ────────────────────────────────────────────────────────────────────────────
interface IrisResult {
  status: "claimable" | "pending";
  message?: string;
  attestation?: string;
  eventNonce?: string; // receiveMessage calldata'sında aranacak
}

async function queryIris(
  sourceDomain: number,
  burnTxHash: string
): Promise<IrisResult> {
  try {
    const res = await fetch(
      `${IRIS_API}/v2/messages/${sourceDomain}?transactionHash=${burnTxHash}`
    );
    if (!res.ok) return { status: "pending" };
    const data = await res.json();
    const msg = data.messages?.[0];

    if (!msg) return { status: "pending" };

    if (msg.status === "complete" && msg.attestation && msg.attestation !== "PENDING") {
      // eventNonce: "0x<64 hex>" formatında geliyor
      const nonce = (msg.eventNonce as string | undefined)?.replace("0x", "").toLowerCase();
      return {
        status: "claimable",
        message: msg.message,
        attestation: msg.attestation,
        eventNonce: nonce,
      };
    }

    return { status: "pending" };
  } catch {
    return { status: "pending" };
  }
}

export async function fetchIrisAttestation(
  sourceDomain: number,
  burnTxHash: string
): Promise<{ message: string; attestation: string } | null> {
  const result = await queryIris(sourceDomain, burnTxHash);
  if (result.status === "claimable" && result.message && result.attestation) {
    return { message: result.message, attestation: result.attestation };
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// On-chain mint kontrolü: receiveMessage calldata'sında nonce var mı?
// Varsa → "complete", yoksa → "claimable"
// ────────────────────────────────────────────────────────────────────────────
function findMintForNonce(
  nonce: string,
  mintTxs: ExplorerTx[]
): ExplorerTx | undefined {
  if (!nonce) return undefined;
  const needle = nonce.toLowerCase();
  return mintTxs.find((tx) => tx.input.toLowerCase().includes(needle));
}

// ────────────────────────────────────────────────────────────────────────────
// Ana: cüzdan adresine göre CCTP history çek
// Sadece bu dapp'ten yapılan tx'ler (localStorage'dan filtre)
// ────────────────────────────────────────────────────────────────────────────

export async function fetchCCTPHistory(
  walletAddress: string,
  etherscanApiKey?: string
): Promise<CCTPBridgeTx[]> {
  // Bu dapp'ten yapılan burn hash'leri
  const dappHashes = getDappBurnHashes();

  // Cüzdanın Arc ve Sepolia tx'lerini paralel çek
  const [arcResult, sepoliaResult] = await Promise.allSettled([
    fetchWalletTxs(walletAddress, "arc"),
    fetchWalletTxs(walletAddress, "sepolia", etherscanApiKey),
  ]);

  const arcTxs = arcResult.status === "fulfilled" ? arcResult.value : [];
  const sepoliaTxs = sepoliaResult.status === "fulfilled" ? sepoliaResult.value : [];

  // receiveMessage tx'leri (mint kontrolü için)
  const arcMintTxs = arcTxs.filter(
    (tx) =>
      tx.to.toLowerCase() === MESSAGE_TRANSMITTER &&
      tx.input.startsWith(RECEIVE_MESSAGE_SELECTOR) &&
      tx.isError === "0"
  );
  const sepoliaMintTxs = sepoliaTxs.filter(
    (tx) =>
      tx.to.toLowerCase() === MESSAGE_TRANSMITTER &&
      tx.input.startsWith(RECEIVE_MESSAGE_SELECTOR) &&
      tx.isError === "0"
  );

  // CCTP burn tx'leri
  // dappHashes doluysa sadece bu dapp'ten yapılanları göster,
  // boşsa (ilk kurulum / localStorage temizlendi) tüm CCTP burn'ları göster
  const hasDappHashes = dappHashes.length > 0;

  const arcBurns = arcTxs.filter(
    (tx) =>
      tx.to.toLowerCase() === TOKEN_MESSENGER &&
      DEPOSIT_SELECTORS.has(tx.input.slice(0, 10)) &&
      tx.isError === "0" &&
      (!hasDappHashes || dappHashes.includes(tx.hash.toLowerCase()))
  );

  const sepoliaBurns = sepoliaTxs.filter(
    (tx) =>
      tx.to.toLowerCase() === TOKEN_MESSENGER &&
      DEPOSIT_SELECTORS.has(tx.input.slice(0, 10)) &&
      tx.isError === "0" &&
      (!hasDappHashes || dappHashes.includes(tx.hash.toLowerCase()))
  );

  // Tüm burn'ları birleştir
  const allBurns: Array<{
    tx: ExplorerTx;
    fromChainId: SupportedChainId;
    toChainId: SupportedChainId;
    sourceDomain: number;
    mintTxs: ExplorerTx[];
  }> = [
    ...arcBurns
      .map((tx) => {
        const decoded = decodeDepositForBurn(tx.input);
        if (!decoded || decoded.destinationDomain !== 0) return null;
        return { tx, fromChainId: arcTestnet.id as SupportedChainId, toChainId: sepolia.id as SupportedChainId, sourceDomain: 26, mintTxs: sepoliaMintTxs };
      })
      .filter(Boolean) as typeof allBurns,

    ...sepoliaBurns
      .map((tx) => {
        const decoded = decodeDepositForBurn(tx.input);
        if (!decoded || decoded.destinationDomain !== 26) return null;
        return { tx, fromChainId: sepolia.id as SupportedChainId, toChainId: arcTestnet.id as SupportedChainId, sourceDomain: 0, mintTxs: arcMintTxs };
      })
      .filter(Boolean) as typeof allBurns,
  ];

  // Her burn için Iris'e sor (max 5 paralel)
  const results: CCTPBridgeTx[] = [];
  const chunks: typeof allBurns[] = [];
  for (let i = 0; i < allBurns.length; i += 5) chunks.push(allBurns.slice(i, i + 5));

  for (const chunk of chunks) {
    const settled = await Promise.allSettled(
      chunk.map(async ({ tx, fromChainId, toChainId, sourceDomain, mintTxs }) => {
        const decoded = decodeDepositForBurn(tx.input)!;
        const iris = await queryIris(sourceDomain, tx.hash);
        const fromConfig = CHAIN_CONFIG[fromChainId];
        const toConfig = CHAIN_CONFIG[toChainId];

        if (iris.status === "pending") {
          return {
            burnTxHash: tx.hash,
            fromChainId,
            toChainId,
            amount: formatUSDC(decoded.amount),
            recipient: decoded.mintRecipient,
            timestamp: parseInt(tx.timeStamp) * 1000,
            status: "pending" as const,
            burnExplorerUrl: `${fromConfig.explorer}/tx/${tx.hash}`,
            destinationDomain: decoded.destinationDomain,
          };
        }

        // Iris attestation hazır — on-chain'de mint var mı?
        const mintTx = iris.eventNonce
          ? findMintForNonce(iris.eventNonce, mintTxs)
          : undefined;

        const item: CCTPBridgeTx = {
          burnTxHash: tx.hash,
          mintTxHash: mintTx?.hash,
          fromChainId,
          toChainId,
          amount: formatUSDC(decoded.amount),
          recipient: decoded.mintRecipient,
          timestamp: parseInt(tx.timeStamp) * 1000,
          status: mintTx ? "complete" : "claimable",
          burnExplorerUrl: `${fromConfig.explorer}/tx/${tx.hash}`,
          mintExplorerUrl: mintTx ? `${toConfig.explorer}/tx/${mintTx.hash}` : undefined,
          destinationDomain: decoded.destinationDomain,
        };

        if (!mintTx) {
          item.irisMessage = iris.message;
          item.irisAttestation = iris.attestation;
        }

        return item;
      })
    );

    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
    }
  }

  results.sort((a, b) => b.timestamp - a.timestamp);
  return results;
}
