"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHAIN_CONFIG } from "@/lib/chains";
import type { SupportedChainId } from "@/lib/chains";

interface TxSharePageProps {
  burnTxHash: string;
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
}

export function TxSharePage({ burnTxHash, fromChainId, toChainId, amount }: TxSharePageProps) {
  const fromConfig = CHAIN_CONFIG[fromChainId];
  const toConfig = CHAIN_CONFIG[toChainId];

  const burnExplorerUrl = `${fromConfig.explorer}/tx/${burnTxHash}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pt-12 pb-16 px-4">
      {/* Background orbs */}
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
          style={{ background: "radial-gradient(circle, rgba(0,179,134,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-[440px] space-y-5">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#6B7A99" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Arc Bridge
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(107,92,231,0.04)",
          }}
        >
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,179,134,0.15)",
                  border: "1px solid rgba(0,179,134,0.35)",
                }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: "#00B386" }} />
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: "#F0F2F8" }}
                >
                  Bridge Complete
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "#6B7A99" }}>
                  via Circle CCTP V2
                </p>
              </div>
            </div>

            {/* Amount */}
            <div
              className="rounded-xl py-5 text-center"
              style={{
                background: "rgba(0,179,134,0.06)",
                border: "1px solid rgba(0,179,134,0.15)",
              }}
            >
              <span className="text-4xl font-bold" style={{ color: "#F0F2F8", letterSpacing: "-0.03em" }}>
                {parseFloat(amount).toFixed(2)}
              </span>
              <span className="text-xl font-semibold ml-2" style={{ color: "#6B7A99" }}>
                USDC
              </span>
            </div>

            {/* Chain flow */}
            <div className="flex items-center gap-3">
              <div
                className="flex-1 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-xs mb-1" style={{ color: "#6B7A99" }}>From</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fromConfig.logo}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#F0F2F8" }}>{fromConfig.shortName}</p>
                    <p className="text-xs" style={{ color: "#6B7A99" }}>Gas: {fromConfig.gasToken}</p>
                  </div>
                </div>
              </div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(107,92,231,0.15)", border: "1px solid rgba(107,92,231,0.25)" }}
              >
                <ArrowRight className="w-3.5 h-3.5" style={{ color: "#A89CF7" }} />
              </div>

              <div
                className="flex-1 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-xs mb-1" style={{ color: "#6B7A99" }}>To</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{toConfig.logo}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#F0F2F8" }}>{toConfig.shortName}</p>
                    <p className="text-xs" style={{ color: "#6B7A99" }}>Gas: {toConfig.gasToken}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tx hash */}
            <div
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs mb-1.5" style={{ color: "#6B7A99" }}>Burn Transaction</p>
              <a
                href={burnExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group"
              >
                <span
                  className="text-xs font-mono truncate"
                  style={{ color: "#A8B3CF" }}
                >
                  {burnTxHash}
                </span>
                <ExternalLink
                  className="w-3.5 h-3.5 ml-2 shrink-0 transition-colors"
                  style={{ color: "#6B7A99" }}
                />
              </a>
            </div>

            {/* CTA */}
            <Link href="/" className="block">
              <Button
                className="w-full h-11 text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #6B5CE7 0%, #4B7CF7 100%)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(107,92,231,0.35)",
                }}
              >
                Bridge on Arc
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: "#3D4A66" }}>
          Powered by{" "}
          <a
            href="https://www.circle.com/en/cross-chain-transfer-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "#6B7A99" }}
          >
            Circle CCTP V2
          </a>
        </p>
      </div>
    </main>
  );
}
