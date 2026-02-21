import { defineChain } from "viem";
import { sepolia } from "wagmi/chains";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

export const SUPPORTED_CHAINS = [sepolia, arcTestnet] as const;

export const CHAIN_CONFIG = {
  [sepolia.id]: {
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    cctpDomain: 0,
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
    tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as `0x${string}`,
    messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as `0x${string}`,
    explorer: "https://sepolia.etherscan.io",
    faucet: "https://faucet.circle.com",
    logo: "⟠",
    color: "#627EEA",
    gasToken: "ETH",
  },
  [arcTestnet.id]: {
    name: "Arc Testnet",
    shortName: "Arc",
    cctpDomain: 26,
    usdc: "0x3600000000000000000000000000000000000000" as `0x${string}`,
    tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as `0x${string}`,
    messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as `0x${string}`,
    explorer: "https://testnet.arcscan.app",
    faucet: "https://faucet.circle.com",
    logo: "◎",
    color: "#00B386",
    gasToken: "USDC",
  },
} as const;

export type SupportedChainId = keyof typeof CHAIN_CONFIG;

export const BRIDGE_CHAINS = {
  SEPOLIA_TO_ARC: {
    from: sepolia.id,
    to: arcTestnet.id,
    label: "Sepolia → Arc Testnet",
  },
  ARC_TO_SEPOLIA: {
    from: arcTestnet.id,
    to: sepolia.id,
    label: "Arc Testnet → Sepolia",
  },
};

export const IRIS_API_URL = "https://iris-api-sandbox.circle.com";
