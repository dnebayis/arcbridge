"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Loader2,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useCCTPHistory } from "@/hooks/useCCTPHistory";
import { useClaim, type ClaimStep } from "@/hooks/useClaim";
import { CHAIN_CONFIG } from "@/lib/chains";
import type { CCTPBridgeTx } from "@/lib/explorer";
import type { SupportedChainId } from "@/lib/chains";
import { cn } from "@/lib/utils";

// ── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  complete: {
    label: "Complete",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  claimable: {
    label: "Claimable",
    className: "bg-[#6B5CE7]/15 text-[#A89CF7] border-[#6B5CE7]/25",
    icon: <Download className="w-3 h-3" />,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/15 text-red-400 border-red-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const CLAIM_STEP_LABELS: Record<ClaimStep, string> = {
  idle: "Claim",
  fetching: "Fetching...",
  switching: "Switching chain...",
  confirming: "Confirm in wallet...",
  complete: "Claimed!",
  error: "Retry",
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// ── Transaction row ───────────────────────────────────────────────────────

function TxRow({
  tx,
  onClaimed,
}: {
  tx: CCTPBridgeTx;
  onClaimed: () => void;
}) {
  const from = CHAIN_CONFIG[tx.fromChainId as SupportedChainId];
  const to = CHAIN_CONFIG[tx.toChainId as SupportedChainId];
  const statusCfg = STATUS_CONFIG[tx.status];
  const { step: claimStep, mintTxHash, error: claimError, claim, reset: resetClaim } = useClaim();

  const isClaiming = ["fetching", "switching", "confirming"].includes(claimStep);
  const claimDone = claimStep === "complete";

  const handleClaim = async () => {
    if (claimStep === "error") resetClaim();
    await claim({
      burnTxHash: tx.burnTxHash,
      fromChainId: tx.fromChainId,
      toChainId: tx.toChainId,
      irisMessage: tx.irisMessage,
      irisAttestation: tx.irisAttestation,
    });
    if (claimStep === "complete") onClaimed();
  };

  // Claim başarılıysa satırı "complete" gibi göster
  const displayStatus = claimDone ? "complete" : tx.status;
  const displayStatusCfg = STATUS_CONFIG[displayStatus];

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl transition-colors" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Chain logos */}
          <div className="flex items-center gap-1 shrink-0">
            <Image src="/usdc.svg" alt="USDC" width={20} height={20} title={from.name} />
            <span className="text-white/20 text-xs">→</span>
            <Image src="/usdc.svg" alt="USDC" width={20} height={20} title={to.name} />
          </div>

          <span className="text-sm font-semibold text-white">{tx.amount} USDC</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={cn("flex items-center gap-1 text-xs border", displayStatusCfg.className)}
          >
            {displayStatusCfg.icon}
            {displayStatusCfg.label}
          </Badge>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/30">
          {from.shortName} → {to.shortName} · {timeAgo(tx.timestamp)}
        </span>

        <div className="flex items-center gap-2">
          {/* Explorer links */}
          {tx.burnTxHash && (
            <a
              href={tx.burnExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/25 hover:text-white/60 transition-colors"
              title={`Burn tx on ${from.shortName}`}
            >
              Burn <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {(tx.mintTxHash || mintTxHash) && (
            <a
              href={
                mintTxHash
                  ? `${to.explorer}/tx/${mintTxHash}`
                  : tx.mintExplorerUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/25 hover:text-white/60 transition-colors"
              title={`Mint tx on ${to.shortName}`}
            >
              Mint <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Claim butonu — sadece claimable durumda */}
          {(tx.status === "claimable" || claimStep === "error") && !claimDone && (
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={isClaiming}
              className={cn(
                "h-6 px-2 text-xs font-medium border",
                claimStep === "error"
                  ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                  : "bg-[#6B5CE7]/15 text-[#A89CF7] border-[#6B5CE7]/25 hover:bg-[#6B5CE7]/25"
              )}
            >
              {isClaiming ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {CLAIM_STEP_LABELS[claimStep]}
                </span>
              ) : (
                CLAIM_STEP_LABELS[claimStep]
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Claim error */}
      {claimStep === "error" && claimError && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 truncate">
          {claimError}
        </p>
      )}

      {/* Claim success */}
      {claimDone && mintTxHash && (
        <p className="text-xs text-[#00B386]">
          ✓ USDC minted on {to.shortName}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function TransactionHistory({
  onRefreshRef,
}: {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const { isConnected } = useAccount();
  const { transactions, loading, error, refresh, lastFetched } = useCCTPHistory();

  if (onRefreshRef) {
    onRefreshRef.current = refresh;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/30">
        <Wallet className="w-8 h-8 opacity-40" />
        <p className="text-sm">Connect your wallet to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/70">Your Transfers</span>
          {lastFetched && (
            <span className="text-xs text-white/20">
              · updated {timeAgo(lastFetched.getTime())}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={refresh}
          disabled={loading}
          className="h-7 px-2 text-white/40 hover:text-white hover:bg-white/10"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && transactions.length === 0 && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-white/30">
          <Clock className="w-8 h-8 opacity-40" />
          <p className="text-sm">No bridge transactions found</p>
          <p className="text-xs text-white/20">
            Transactions appear after they are confirmed on-chain
          </p>
        </div>
      )}

      {/* Transactions */}
      {transactions.length > 0 && (
        <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {transactions.map((tx) => (
            <TxRow key={tx.burnTxHash} tx={tx} onClaimed={refresh} />
          ))}
        </div>
      )}

      {/* Claimable notice */}
      {transactions.some((tx) => tx.status === "claimable") && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
          style={{
            background: "rgba(107,92,231,0.07)",
            border: "1px solid rgba(107,92,231,0.18)",
            color: "#A89CF7",
          }}
        >
          <Download className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#8B7CF0" }} />
          <p>
            <strong>Claimable</strong> transfers are ready to mint. Click{" "}
            <strong>Claim</strong> to complete them on the destination chain.
          </p>
        </div>
      )}
    </div>
  );
}
