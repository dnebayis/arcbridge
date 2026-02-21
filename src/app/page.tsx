"use client";

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BridgeWidget } from "@/components/bridge/BridgeWidget";
import { TransactionHistory } from "@/components/bridge/TransactionHistory";
import { ArrowLeftRight, History, ExternalLink } from "lucide-react";

export default function Home() {
  const historyRefreshRef = useRef<(() => void) | null>(null);

  const handleTabChange = (value: string) => {
    if (value === "history" && historyRefreshRef.current) {
      historyRefreshRef.current();
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pt-12 pb-16 px-4">
      {/* Background — Arc brand gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(107,92,231,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,111,212,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(107,92,231,0.05) 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-[440px] space-y-5">
        {/* Hero text */}
        <div className="text-center space-y-1.5 pb-2">
          <h1
            className="text-2xl font-semibold"
            style={{ color: "#F0F2F8", letterSpacing: "-0.02em" }}
          >
            Bridge USDC
          </h1>
          <p className="text-sm" style={{ color: "#6B7A99" }}>
            Native transfers via Circle CCTP V2 — no wrapped tokens
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(107,92,231,0.04)",
          }}
        >
          <Tabs defaultValue="bridge" onValueChange={handleTabChange} className="w-full">
            <TabsList
              className="w-full rounded-none border-b bg-transparent p-0 gap-0 h-auto"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <TabsTrigger
                value="bridge"
                className="flex-1 flex items-center justify-center gap-2 rounded-none h-12 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-[#6B5CE7] data-[state=active]:text-white text-[#6B7A99] transition-all bg-transparent"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Bridge
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 flex items-center justify-center gap-2 rounded-none h-12 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-[#6B5CE7] data-[state=active]:text-white text-[#6B7A99] transition-all bg-transparent"
              >
                <History className="w-3.5 h-3.5" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bridge" className="p-6 mt-0">
              <BridgeWidget />
            </TabsContent>

            <TabsContent value="history" className="p-6 mt-0">
              <TransactionHistory onRefreshRef={historyRefreshRef} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-5 text-xs" style={{ color: "#3D4A66" }}>
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#6B7A99] transition-colors"
          >
            USDC Faucet <ExternalLink className="w-3 h-3" />
          </a>
          <span style={{ color: "#1E2A42" }}>·</span>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#6B7A99] transition-colors"
          >
            Arc Explorer <ExternalLink className="w-3 h-3" />
          </a>
          <span style={{ color: "#1E2A42" }}>·</span>
          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#6B7A99] transition-colors"
          >
            Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs" style={{ color: "#1E2A42" }}>
          Built by{" "}
          <a
            href="https://siyabald.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#6B7A99] transition-colors"
            style={{ color: "#2A3A58" }}
          >
            siyabald.vercel.app
          </a>
          <span>·</span>
          <a
            href="https://x.com/siyabaldacc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#6B7A99] transition-colors"
            style={{ color: "#2A3A58" }}
          >
            @siyabaldacc
          </a>
        </div>
      </div>
    </main>
  );
}
