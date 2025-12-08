import dotenv from "dotenv";
import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

dotenv.config();

const argv = process.argv.slice(2);
const getArg = (key: string) => {
  const idx = argv.findIndex((a) => a === key);
  if (idx === -1) return undefined;
  const val = argv[idx + 1];
  if (!val || val.startsWith("--")) return undefined;
  return val;
};

const execute = argv.includes("--execute");
const estimate = argv.includes("--estimate");

const fromChain = getArg("--from") || process.env.FROM_CHAIN || "Arc_Testnet";
const toChain = getArg("--to") || process.env.TO_CHAIN || "Ethereum_Sepolia";
const amount = getArg("--amount") || process.env.AMOUNT || "1.00";
const recipient = getArg("--recipient") || process.env.RECIPIENT || undefined;
const transferSpeed = (getArg("--speed") || process.env.TRANSFER_SPEED || "FAST") as "FAST" | "SLOW";

const pk = (process.env.PRIVATE_KEY || "").trim();

const toJSON = (obj: any) =>
  JSON.stringify(
    obj,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

async function main() {
  if (!pk) {
    console.error("PRIVATE_KEY is missing. Set it in .env.");
    process.exit(1);
  }

  const adapter = await createAdapterFromPrivateKey({
    privateKey: pk as `0x${string}`,
  });

  const kit = new BridgeKit();

  if (estimate) {
    const toCtx = recipient
      ? { adapter, chain: toChain as any, recipientAddress: recipient }
      : { adapter, chain: toChain as any };
    const res = await kit.estimate({
      from: { adapter, chain: fromChain as any },
      to: toCtx as any,
      amount,
      config: { transferSpeed },
    });
    console.log(toJSON(res));
    return;
  }

  if (execute) {
    const toCtx = recipient
      ? { adapter, chain: toChain as any, recipientAddress: recipient }
      : { adapter, chain: toChain as any };
    const res = await kit.bridge({
      from: { adapter, chain: fromChain as any },
      to: toCtx as any,
      amount,
      config: { transferSpeed },
    });
    console.log(toJSON(res));
    return;
  }

  console.log("Usage:");
  console.log("  ts-node src/bridge.ts --estimate --from Arc_Testnet --to Ethereum_Sepolia --amount 10.00");
  console.log("  ts-node src/bridge.ts --execute  --from Arc_Testnet --to Ethereum_Sepolia --amount 10.00");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
