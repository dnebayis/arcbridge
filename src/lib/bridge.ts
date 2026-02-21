import { IRIS_API_URL, CHAIN_CONFIG, type SupportedChainId } from "./chains";

export const USDC_DECIMALS = 6;

export function parseUSDC(amount: string): bigint {
  const [int, dec = ""] = amount.split(".");
  const padded = dec.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(int + padded);
}

export function formatUSDC(amount: bigint): string {
  const str = amount.toString().padStart(USDC_DECIMALS + 1, "0");
  const int = str.slice(0, -USDC_DECIMALS);
  const dec = str.slice(-USDC_DECIMALS).replace(/0+$/, "");
  return dec ? `${int}.${dec}` : int;
}

export function addressToBytes32(address: string): `0x${string}` {
  return `0x${address.replace("0x", "").padStart(64, "0")}` as `0x${string}`;
}

export type BridgeStep =
  | "idle"
  | "approving"
  | "burning"
  | "attesting"
  | "minting"
  | "complete"
  | "error";

export interface BridgeTransaction {
  id: string;
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
  recipient: string;
  burnTxHash?: string;
  mintTxHash?: string;
  step: BridgeStep;
  error?: string;
  timestamp: number;
  message?: string;
  attestation?: string;
}

export interface AttestationResponse {
  messages: Array<{
    eventNonce: string;
    attestation: string;
    status: "pending_confirmations" | "complete";
    message: string;
    sourceDomain: number;
    destinationDomain: number;
  }>;
}

export async function pollAttestation(
  sourceDomain: number,
  txHash: string,
  onProgress?: (attempt: number) => void
): Promise<{ message: string; attestation: string }> {
  let attempt = 0;
  const maxAttempts = 120; // 10 dakika max

  while (attempt < maxAttempts) {
    attempt++;
    onProgress?.(attempt);

    try {
      const res = await fetch(
        `${IRIS_API_URL}/v2/messages/${sourceDomain}?transactionHash=${txHash}`
      );

      if (res.status === 404) {
        await sleep(5000);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Iris API error: ${res.status}`);
      }

      const data: AttestationResponse = await res.json();

      if (data.messages?.length > 0) {
        const msg = data.messages[0];
        if (msg.status === "complete" && msg.attestation !== "PENDING") {
          return { message: msg.message, attestation: msg.attestation };
        }
      }
    } catch (err) {
      if (attempt >= maxAttempts) throw err;
    }

    await sleep(5000);
  }

  throw new Error("Attestation timed out after 10 minutes");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getExplorerTxUrl(chainId: SupportedChainId, txHash: string): string {
  const config = CHAIN_CONFIG[chainId];
  return `${config.explorer}/tx/${txHash}`;
}

export const BRIDGE_STEPS: Record<BridgeStep, { label: string; description: string }> = {
  idle: { label: "Ready", description: "Enter amount to bridge" },
  approving: { label: "Approving", description: "Approving USDC spending..." },
  burning: { label: "Burning", description: "Burning USDC on source chain..." },
  attesting: { label: "Attesting", description: "Waiting for Circle attestation..." },
  minting: { label: "Minting", description: "Minting USDC on destination chain..." },
  complete: { label: "Complete", description: "Bridge transfer complete!" },
  error: { label: "Error", description: "Something went wrong" },
};

export const STEP_ORDER: BridgeStep[] = [
  "idle",
  "approving",
  "burning",
  "attesting",
  "minting",
  "complete",
];

export function getStepIndex(step: BridgeStep): number {
  return STEP_ORDER.indexOf(step);
}

const HISTORY_KEY = "arc_bridge_history";

export function saveTransaction(tx: BridgeTransaction): void {
  if (typeof window === "undefined") return;
  const history = getTransactionHistory();
  const existing = history.findIndex((t) => t.id === tx.id);
  if (existing >= 0) {
    history[existing] = tx;
  } else {
    history.unshift(tx);
  }
  // Max 20 kayıt tut
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function getTransactionHistory(): BridgeTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function generateTxId(): string {
  return `bridge_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
