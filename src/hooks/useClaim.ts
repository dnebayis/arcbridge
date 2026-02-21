"use client";

import { useState, useCallback } from "react";
import { useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import { parseAbi, encodeFunctionData } from "viem";
import { sepolia } from "wagmi/chains";
import { arcTestnet, CHAIN_CONFIG, type SupportedChainId } from "@/lib/chains";
import { fetchIrisAttestation } from "@/lib/explorer";

const MESSAGE_TRANSMITTER_ABI = parseAbi([
  "function receiveMessage(bytes message, bytes attestation) returns (bool)",
]);

export type ClaimStep = "idle" | "fetching" | "switching" | "confirming" | "complete" | "error";

export interface UseClaimReturn {
  step: ClaimStep;
  mintTxHash: string | null;
  error: string | null;
  claim: (params: {
    burnTxHash: string;
    fromChainId: SupportedChainId;
    toChainId: SupportedChainId;
    // Önceden yüklenmiş attestation varsa direkt kullan
    irisMessage?: string;
    irisAttestation?: string;
  }) => Promise<void>;
  reset: () => void;
}

export function useClaim(): UseClaimReturn {
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const publicClientSepolia = usePublicClient({ chainId: sepolia.id });
  const publicClientArc = usePublicClient({ chainId: arcTestnet.id });

  const [step, setStep] = useState<ClaimStep>("idle");
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setMintTxHash(null);
    setError(null);
  }, []);

  const claim = useCallback(
    async ({
      burnTxHash,
      fromChainId,
      toChainId,
      irisMessage,
      irisAttestation,
    }: {
      burnTxHash: string;
      fromChainId: SupportedChainId;
      toChainId: SupportedChainId;
      irisMessage?: string;
      irisAttestation?: string;
    }) => {
      if (!walletClient) {
        setError("Wallet not connected");
        return;
      }

      setError(null);
      setMintTxHash(null);

      try {
        // ── Attestation al (önce cache'den, yoksa Iris'ten) ──────────────
        let message = irisMessage;
        let attestation = irisAttestation;

        if (!message || !attestation) {
          setStep("fetching");
          const sourceDomain = fromChainId === (arcTestnet.id as SupportedChainId) ? 26 : 0;
          const iris = await fetchIrisAttestation(sourceDomain, burnTxHash);
          if (!iris) {
            throw new Error(
              "Attestation not ready yet. Circle may still be processing this transfer."
            );
          }
          message = iris.message;
          attestation = iris.attestation;
        }

        // ── Destination chain'e geç ───────────────────────────────────────
        setStep("switching");
        await switchChainAsync({ chainId: toChainId });

        const toConfig = CHAIN_CONFIG[toChainId];
        const toChain = toChainId === sepolia.id ? sepolia : arcTestnet;
        const toPublicClient =
          toChainId === sepolia.id ? publicClientSepolia : publicClientArc;

        if (!toPublicClient) throw new Error("Public client not available");

        // ── receiveMessage çağır ─────────────────────────────────────────
        setStep("confirming");
        const data = encodeFunctionData({
          abi: MESSAGE_TRANSMITTER_ABI,
          functionName: "receiveMessage",
          args: [message as `0x${string}`, attestation as `0x${string}`],
        });

        const hash = await walletClient.sendTransaction({
          to: toConfig.messageTransmitterV2,
          data,
          chain: toChain,
        });

        setMintTxHash(hash);
        await toPublicClient.waitForTransactionReceipt({ hash });

        setStep("complete");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        setStep("error");
      }
    },
    [walletClient, switchChainAsync, publicClientSepolia, publicClientArc]
  );

  return { step, mintTxHash, error, claim, reset };
}
