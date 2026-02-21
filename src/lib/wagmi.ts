import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { arcTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Arc Bridge",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [sepolia, arcTestnet],
  ssr: true,
});
