"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { parseAbi, encodeFunctionData } from "viem";
import { sepolia } from "wagmi/chains";
import {
  parseUSDC,
  formatUSDC,
  addressToBytes32,
  pollAttestation,
  saveTransaction,
  generateTxId,
  type BridgeStep,
  type BridgeTransaction,
} from "@/lib/bridge";
import { saveBurnTxHash } from "@/lib/explorer";
import { CHAIN_CONFIG, arcTestnet, type SupportedChainId } from "@/lib/chains";

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
]);

const TOKEN_MESSENGER_ABI = parseAbi([
  "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold) returns (uint64)",
]);

const MESSAGE_TRANSMITTER_ABI = parseAbi([
  "function receiveMessage(bytes message, bytes attestation) returns (bool)",
]);

export interface UseBridgeOptions {
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  amount: string;
  recipient?: string;
  transferMode: "fast" | "standard";
}

export interface UseBridgeReturn {
  step: BridgeStep;
  error: string | null;
  burnTxHash: string | null;
  mintTxHash: string | null;
  attestationAttempt: number;
  currentTx: BridgeTransaction | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export function useBridge({
  fromChainId,
  toChainId,
  amount,
  recipient,
  transferMode,
}: UseBridgeOptions): UseBridgeReturn {
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClientSepolia = usePublicClient({ chainId: sepolia.id });
  const publicClientArc = usePublicClient({ chainId: arcTestnet.id });
  const { data: walletClient } = useWalletClient();

  const [step, setStep] = useState<BridgeStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [burnTxHash, setBurnTxHash] = useState<string | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [attestationAttempt, setAttestationAttempt] = useState(0);
  const [currentTx, setCurrentTx] = useState<BridgeTransaction | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setBurnTxHash(null);
    setMintTxHash(null);
    setAttestationAttempt(0);
    setCurrentTx(null);
  }, []);

  const execute = useCallback(async () => {
    if (!address || !walletClient) {
      setError("Wallet not connected");
      return;
    }

    const recipientAddr = recipient || address;
    const fromConfig = CHAIN_CONFIG[fromChainId];
    const toConfig = CHAIN_CONFIG[toChainId];
    const amountBigInt = parseUSDC(amount);

    if (amountBigInt <= 0n) {
      setError("Amount must be greater than 0");
      return;
    }

    const txId = generateTxId();
    const tx: BridgeTransaction = {
      id: txId,
      fromChainId,
      toChainId,
      amount,
      recipient: recipientAddr,
      step: "approving",
      timestamp: Date.now(),
    };

    setError(null);
    setCurrentTx(tx);

    try {
      // Kaynak chain'e geç
      await switchChainAsync({ chainId: fromChainId });

      const fromPublicClient =
        fromChainId === sepolia.id ? publicClientSepolia : publicClientArc;

      if (!fromPublicClient) throw new Error("Public client not available");

      // ── STEP 1: Approve ──────────────────────────────────────────────
      setStep("approving");
      tx.step = "approving";
      saveTransaction(tx);

      const allowance = await fromPublicClient.readContract({
        address: fromConfig.usdc,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, fromConfig.tokenMessengerV2],
      });

      if (allowance < amountBigInt) {
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [fromConfig.tokenMessengerV2, amountBigInt],
        });

        const approveTx = await walletClient.sendTransaction({
          to: fromConfig.usdc,
          data: approveData,
          chain: fromChainId === sepolia.id ? sepolia : arcTestnet,
        });

        await fromPublicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // ── STEP 2: Burn (depositForBurn) ────────────────────────────────
      setStep("burning");
      tx.step = "burning";
      saveTransaction(tx);

      const mintRecipientBytes32 = addressToBytes32(recipientAddr);
      const minFinalityThreshold = transferMode === "fast" ? 1000 : 2000;
      // Fast transfer için max fee: 0.001 USDC = 1000 (6 decimals)
      const maxFee = transferMode === "fast" ? 1000n : 0n;

      const burnData = encodeFunctionData({
        abi: TOKEN_MESSENGER_ABI,
        functionName: "depositForBurn",
        args: [
          amountBigInt,
          toConfig.cctpDomain,
          mintRecipientBytes32 as `0x${string}`,
          fromConfig.usdc,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          maxFee,
          minFinalityThreshold,
        ],
      });

      const burnTx = await walletClient.sendTransaction({
        to: fromConfig.tokenMessengerV2,
        data: burnData,
        chain: fromChainId === sepolia.id ? sepolia : arcTestnet,
      });

      setBurnTxHash(burnTx);
      tx.burnTxHash = burnTx;
      saveTransaction(tx);

      await fromPublicClient.waitForTransactionReceipt({ hash: burnTx });
      saveBurnTxHash(burnTx);

      // ── STEP 3: Attestation ──────────────────────────────────────────
      setStep("attesting");
      tx.step = "attesting";
      saveTransaction(tx);

      const { message, attestation } = await pollAttestation(
        fromConfig.cctpDomain,
        burnTx,
        (attempt) => setAttestationAttempt(attempt)
      );

      tx.message = message;
      tx.attestation = attestation;
      saveTransaction(tx);

      // ── STEP 4: Mint (receiveMessage) ────────────────────────────────
      setStep("minting");
      tx.step = "minting";
      saveTransaction(tx);

      await switchChainAsync({ chainId: toChainId });

      const toPublicClient =
        toChainId === sepolia.id ? publicClientSepolia : publicClientArc;

      if (!toPublicClient) throw new Error("Destination public client not available");

      const mintData = encodeFunctionData({
        abi: MESSAGE_TRANSMITTER_ABI,
        functionName: "receiveMessage",
        args: [message as `0x${string}`, attestation as `0x${string}`],
      });

      const mintTx = await walletClient.sendTransaction({
        to: toConfig.messageTransmitterV2,
        data: mintData,
        chain: toChainId === sepolia.id ? sepolia : arcTestnet,
      });

      setMintTxHash(mintTx);
      tx.mintTxHash = mintTx;

      await toPublicClient.waitForTransactionReceipt({ hash: mintTx });

      // ── COMPLETE ─────────────────────────────────────────────────────
      setStep("complete");
      tx.step = "complete";
      saveTransaction(tx);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStep("error");
      tx.step = "error";
      tx.error = message;
      saveTransaction(tx);
    }
  }, [
    address,
    walletClient,
    recipient,
    fromChainId,
    toChainId,
    amount,
    transferMode,
    switchChainAsync,
    publicClientSepolia,
    publicClientArc,
  ]);

  return {
    step,
    error,
    burnTxHash,
    mintTxHash,
    attestationAttempt,
    currentTx,
    execute,
    reset,
  };
}

export function useUSDCBalance(chainId: SupportedChainId) {
  const { address } = useAccount();
  const config = CHAIN_CONFIG[chainId];
  const publicClient = usePublicClient({ chainId });

  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address || !publicClient) return;
    setLoading(true);
    try {
      const bal = await publicClient.readContract({
        address: config.usdc,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(bal);
    } catch {
      setBalance(0n);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, config.usdc]);

  return { balance, loading, refresh, formatted: formatUSDC(balance) };
}
