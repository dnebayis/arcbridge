"use client";

import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAIN_CONFIG, type SupportedChainId } from "@/lib/chains";

interface ChainSelectorProps {
  fromChainId: SupportedChainId;
  toChainId: SupportedChainId;
  onSwap: () => void;
  disabled?: boolean;
}

export function ChainSelector({
  fromChainId,
  toChainId,
  onSwap,
  disabled,
}: ChainSelectorProps) {
  const from = CHAIN_CONFIG[fromChainId];
  const to = CHAIN_CONFIG[toChainId];

  return (
    <div className="flex items-center gap-3">
      {/* From Chain */}
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-white/40 mb-1">From</p>
        <div className="flex items-center gap-2">
          <Image src="/usdc.svg" alt="USDC" width={24} height={24} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">{from.shortName}</p>
            <p className="text-xs text-white/40">Gas: {from.gasToken}</p>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={onSwap}
        disabled={disabled}
        className={cn(
          "w-10 h-10 rounded-full border border-white/10 bg-white/5",
          "flex items-center justify-center text-white/60",
          "hover:bg-white/10 hover:text-white transition-all duration-200",
          "hover:rotate-180 active:scale-95",
          disabled && "opacity-40 cursor-not-allowed hover:rotate-0"
        )}
      >
        <ArrowLeftRight className="w-4 h-4" />
      </button>

      {/* To Chain */}
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-white/40 mb-1">To</p>
        <div className="flex items-center gap-2">
          <Image src="/usdc.svg" alt="USDC" width={24} height={24} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">{to.shortName}</p>
            <p className="text-xs text-white/40">Gas: {to.gasToken}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
