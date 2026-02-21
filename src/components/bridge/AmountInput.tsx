"use client";

import { useEffect, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUSDCBalance } from "@/hooks/useBridge";
import { type SupportedChainId } from "@/lib/chains";
import { formatUSDC } from "@/lib/bridge";

interface AmountInputProps {
  chainId: SupportedChainId;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AmountInput({ chainId, value, onChange, disabled }: AmountInputProps) {
  const { balance, loading, refresh, formatted } = useUSDCBalance(chainId);

  useEffect(() => {
    refresh();
  }, [refresh, chainId]);

  const handleMax = useCallback(() => {
    if (balance > 0n) {
      onChange(formatUSDC(balance));
    }
  }, [balance, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Sadece sayı ve nokta
    if (/^\d*\.?\d{0,6}$/.test(val) || val === "") {
      onChange(val);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60">Amount</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            Balance:{" "}
            {loading ? (
              <Loader2 className="inline w-3 h-3 animate-spin" />
            ) : (
              <span className="text-white/70">{formatted} USDC</span>
            )}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="bg-white/5 border-white/10 text-white text-lg h-14 pr-28 focus:border-[#00B386]/50 focus:ring-[#00B386]/20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMax}
            disabled={disabled || balance === 0n}
            className="h-7 px-2 text-xs text-[#00B386] hover:text-[#00B386] hover:bg-[#00B386]/10"
          >
            MAX
          </Button>
          <span className="text-sm font-semibold text-white/60 border-l border-white/10 pl-2">
            USDC
          </span>
        </div>
      </div>

      {value && parseFloat(value) > parseFloat(formatted) && (
        <p className="text-xs text-red-400">Insufficient USDC balance</p>
      )}
    </div>
  );
}
