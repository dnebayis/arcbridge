"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { StepIndicator } from "./StepIndicator";
import { BridgeResult } from "./BridgeResult";
import { useBridge } from "@/hooks/useBridge";
import { arcTestnet, type SupportedChainId } from "@/lib/chains";
import { sepolia } from "wagmi/chains";

export function BridgeWidget() {
  const { isConnected } = useAccount();

  const [fromChainId, setFromChainId] = useState<SupportedChainId>(sepolia.id);
  const [toChainId, setToChainId] = useState<SupportedChainId>(arcTestnet.id);
  const [amount, setAmount] = useState("");

  const { step, error, burnTxHash, mintTxHash, attestationAttempt, execute, reset } = useBridge({
    fromChainId,
    toChainId,
    amount,
    transferMode: "fast",
  });

  const handleSwap = useCallback(() => {
    setFromChainId(toChainId);
    setToChainId(fromChainId);
  }, [fromChainId, toChainId]);

  const handleReset = useCallback(() => {
    reset();
    setAmount("");
  }, [reset]);

  const isProcessing = ["approving", "burning", "attesting", "minting"].includes(step);
  const isComplete = step === "complete" || step === "error";
  const canBridge = isConnected && amount && parseFloat(amount) > 0 && !isProcessing;

  // Arc → Sepolia'da Arc ağında USDC gas gerektiğine dair uyarı
  const showArcGasWarning = fromChainId === arcTestnet.id;

  return (
    <div className="space-y-4">
      {/* İşlem aktifse ve tamamlanmadıysa progress göster */}
      {isProcessing && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <StepIndicator currentStep={step} attestationAttempt={attestationAttempt} />
          <p className="text-center text-sm text-white/50 mt-2">
            {step === "attesting"
              ? `Waiting for Circle attestation... (~${Math.ceil(attestationAttempt * 5 / 60)}m elapsed)`
              : step === "approving"
              ? "Please approve USDC spending in your wallet"
              : step === "burning"
              ? "Confirm the burn transaction in your wallet"
              : "Confirm the mint transaction in your wallet"}
          </p>
        </div>
      )}

      {/* Sonuç ekranı */}
      {isComplete && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <BridgeResult
            step={step}
            error={error}
            burnTxHash={burnTxHash}
            mintTxHash={mintTxHash}
            fromChainId={fromChainId}
            toChainId={toChainId}
            amount={amount}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Ana form */}
      {!isComplete && (
        <div className="space-y-4">
          <ChainSelector
            fromChainId={fromChainId}
            toChainId={toChainId}
            onSwap={handleSwap}
            disabled={isProcessing}
          />

          <AmountInput
            chainId={fromChainId}
            value={amount}
            onChange={setAmount}
            disabled={isProcessing}
          />

          {/* Fee breakdown */}
          {amount && parseFloat(amount) > 0 && (
            <div
              className="px-3 py-2.5 rounded-xl text-xs space-y-1.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between text-white/40">
                <span>You send</span>
                <span className="text-white/70 font-medium">{parseFloat(amount).toFixed(6)} USDC</span>
              </div>
              <div className="flex items-center justify-between text-white/40">
                <span>CCTP fast fee</span>
                <span className="text-amber-400/80">− 0.001 USDC</span>
              </div>
              <div
                className="h-px"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="flex items-center justify-between font-medium">
                <span className="text-white/60">You receive</span>
                <span style={{ color: "#00B386" }}>
                  {Math.max(0, parseFloat(amount) - 0.001).toFixed(6)} USDC
                </span>
              </div>
            </div>
          )}

          {/* Arc gas uyarısı */}
          {showArcGasWarning && (
            <div
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs"
              style={{
                background: "rgba(234,179,8,0.07)",
                border: "1px solid rgba(234,179,8,0.18)",
                color: "rgba(253,224,71,0.8)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "rgba(253,224,71,0.7)" }} />
              <span>
                Arc Testnet uses <strong>USDC as gas</strong>. Ensure you have enough USDC
                for both the transfer and gas fees.
              </span>
            </div>
          )}

          {/* CCTP info */}
          <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs"
            style={{
              background: "rgba(107,92,231,0.06)",
              border: "1px solid rgba(107,92,231,0.12)",
              color: "#6B7A99",
            }}
          >
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#4A5568" }} />
            <span>
              Powered by Circle CCTP V2. USDC is burned on source and natively minted on
              destination — no wrapped tokens.
            </span>
          </div>

          {/* Bridge button */}
          {!isConnected ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ) : (
            <Button
              onClick={execute}
              disabled={!canBridge}
              className="w-full h-12 text-sm font-semibold transition-opacity disabled:opacity-30"
              style={{
                background: canBridge
                  ? "linear-gradient(135deg, #6B5CE7 0%, #4B7CF7 100%)"
                  : "rgba(107,92,231,0.3)",
                color: "#ffffff",
                border: "none",
                boxShadow: canBridge ? "0 4px 20px rgba(107,92,231,0.35)" : "none",
              }}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </span>
              ) : (
                `Bridge ${amount || "0"} USDC`
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
