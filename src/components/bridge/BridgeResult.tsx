"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExplorerTxUrl, type BridgeStep } from "@/lib/bridge";
import { CHAIN_CONFIG, type SupportedChainId } from "@/lib/chains";

// ── X (Twitter) logo ───────────────────────────────────────────────────────
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function buildImageApiUrl(
  burnTxHash: string,
  fromChainId: SupportedChainId,
  toChainId: SupportedChainId,
  amount: string
) {
  // Use relative path so it works on any deployment
  return `/api/tx-image?hash=${burnTxHash}&from=${fromChainId}&to=${toChainId}&amount=${amount}`;
}

// ── PNG Preview Modal ──────────────────────────────────────────────────────
function PngPreviewModal({
  imageUrl,
  downloadUrl,
  onClose,
}: {
  imageUrl: string;
  downloadUrl: string;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      const filename = downloadUrl.match(/hash=([^&]+)/)?.[1]?.slice(0, 8) ?? "tx";
      a.download = `arc-bridge-${filename}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8,12,24,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Preview image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Bridge receipt preview"
          className="w-full block"
          style={{ aspectRatio: "1200/630", objectFit: "cover" }}
        />

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-xs" style={{ color: "#6B7A99" }}>
            1200 × 630 — ready to share on X, Telegram, Discord
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #6B5CE7, #4B7CF7)",
              color: "#fff",
            }}
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {downloading ? "Downloading..." : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share buttons ──────────────────────────────────────────────────────────
function ActionButtons({
  burnTxHash,
  fromChainId,
  toChainId,
  amount,
}: {
  burnTxHash: string;
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const fromConfig = CHAIN_CONFIG[fromChainId];
  const toConfig = CHAIN_CONFIG[toChainId];

  const imageApiUrl = buildImageApiUrl(burnTxHash, fromChainId, toChainId, amount);

  const handleShareX = () => {
    const siteUrl = window.location.origin;
    const text = `just bridged ${amount} USDC from ${fromConfig.shortName} to ${toConfig.shortName} via @arc using Circle CCTP V2\n\n${siteUrl}`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#A8B3CF",
        }}
      >
        <Download className="w-3.5 h-3.5" />
        PNG
      </button>

      <button
        onClick={handleShareX}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#F0F2F8",
        }}
      >
        <XIcon className="w-3 h-3" />
        Share
      </button>

      {showPreview && (
        <PngPreviewModal
          imageUrl={imageApiUrl}
          downloadUrl={imageApiUrl}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
interface BridgeResultProps {
  step: BridgeStep;
  error: string | null;
  burnTxHash: string | null;
  mintTxHash: string | null;
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
  onReset: () => void;
}

export function BridgeResult({
  step,
  error,
  burnTxHash,
  mintTxHash,
  fromChainId,
  toChainId,
  amount,
  onReset,
}: BridgeResultProps) {
  const fromConfig = CHAIN_CONFIG[fromChainId];
  const toConfig = CHAIN_CONFIG[toChainId];

  if (step === "complete") {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#00B386]/20 border border-[#00B386]/40 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#00B386]" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">Bridge Complete!</h3>
          <p className="text-white/50 text-sm mt-1">
            {amount} USDC transferred from {fromConfig.shortName} to {toConfig.shortName}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {burnTxHash && (
            <a
              href={getExplorerTxUrl(fromChainId, burnTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: fromConfig.color + "30", color: fromConfig.color }}
                >
                  {fromConfig.logo}
                </div>
                <span className="text-sm text-white/70">Burn tx on {fromConfig.shortName}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
            </a>
          )}

          {mintTxHash && (
            <a
              href={getExplorerTxUrl(toChainId, mintTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: toConfig.color + "30", color: toConfig.color }}
                >
                  {toConfig.logo}
                </div>
                <span className="text-sm text-white/70">Mint tx on {toConfig.shortName}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
            </a>
          )}
        </div>

        {/* PNG + Share X + Bridge Again */}
        <div className="flex items-center gap-2">
          {burnTxHash && (
            <ActionButtons
              burnTxHash={burnTxHash}
              fromChainId={fromChainId}
              toChainId={toChainId}
              amount={amount}
            />
          )}
          <Button
            onClick={onReset}
            className="flex-1 bg-[#00B386] hover:bg-[#00B386]/80 text-white"
          >
            Bridge Again
          </Button>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">Transfer Failed</h3>
          <p className="text-white/50 text-sm mt-1 max-w-xs mx-auto break-words">
            {error || "An unexpected error occurred"}
          </p>
        </div>

        {burnTxHash && (
          <a
            href={getExplorerTxUrl(fromChainId, burnTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-white/60"
          >
            <span>View burn transaction</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return null;
}
