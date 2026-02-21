"use client";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(8,12,24,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/arc-icon.svg" alt="Arc" width={28} height={28} />
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "#F0F2F8", letterSpacing: "-0.01em" }}
          >
            Arc Bridge
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(107,92,231,0.15)",
              color: "#A89CF7",
              border: "1px solid rgba(107,92,231,0.25)",
            }}
          >
            Testnet
          </span>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
}
