"use client";

import { Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferModeSelectorProps {
  mode: "fast" | "standard";
  onChange: (mode: "fast" | "standard") => void;
  disabled?: boolean;
}

const MODES = [
  {
    id: "fast" as const,
    label: "Fast",
    description: "~30 seconds",
    fee: "0–14 bps",
    icon: Zap,
    color: "#F59E0B",
  },
  {
    id: "standard" as const,
    label: "Standard",
    description: "~20 minutes",
    fee: "Free",
    icon: Clock,
    color: "#00B386",
  },
];

export function TransferModeSelector({ mode, onChange, disabled }: TransferModeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/60">Transfer Mode</label>
      <div className="grid grid-cols-2 gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all duration-200",
                "hover:bg-white/5",
                isSelected
                  ? "border-[#00B386]/60 bg-[#00B386]/10"
                  : "border-white/10 bg-white/[0.02]",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className="w-4 h-4"
                  style={{ color: isSelected ? m.color : "rgba(255,255,255,0.4)" }}
                />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-white" : "text-white/50"
                  )}
                >
                  {m.label}
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-white/40">{m.description}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-[#00B386]" : "text-white/30"
                  )}
                >
                  {m.fee}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
