import React from "react";
import { createRoot } from "react-dom/client";
import { http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import App from "./App";

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network/"] },
    public: { http: ["https://rpc.testnet.arc.network/"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
};

const queryClient = new QueryClient();
const wcProjectId = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

let wagmiConfig: any = undefined;
if (wcProjectId) {
  wagmiConfig = getDefaultConfig({
    appName: "Arc Bridge",
    projectId: wcProjectId,
    chains: [sepolia, arcTestnet as any],
    transports: {
      [sepolia.id]: http(),
      [arcTestnet.id]: http("https://rpc.testnet.arc.network/"),
    },
  });
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {wagmiConfig ? (
        <WagmiProvider config={wagmiConfig}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#00ff41",
              accentColorForeground: "black",
              borderRadius: "none",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            <App />
          </RainbowKitProvider>
        </WagmiProvider>
      ) : (
        <div style={{ maxWidth: 720, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
          <h1 style={{ margin: 0 }}>Arc Bridge</h1>
          <p style={{ marginTop: 12 }}>
            Set <code>VITE_WALLETCONNECT_PROJECT_ID</code> in <code>.env</code> to enable wallet connection.
          </p>
        </div>
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
