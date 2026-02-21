import { ImageResponse } from "next/og";
import { CHAIN_CONFIG } from "@/lib/chains";

// Render at 2x for crisp output — displayed at 1200×630
const W = 2400;
const H = 1260;
function px(n: number) { return n * 2; }

function UsdcLogo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 2000 2000" width={size} height={size} style={{ display: "flex", flexShrink: 0 }}>
      <circle cx="1000" cy="1000" r="1000" fill="#2775CA" />
      <path
        d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
        fill="#fff"
      />
    </svg>
  );
}

export function generateReceiptImage(params: {
  hash: string;
  fromChainId: number;
  toChainId: number;
  amount: string;
}): ImageResponse {
  const { fromChainId, toChainId, amount } = params;

  const fromConfig = CHAIN_CONFIG[fromChainId as keyof typeof CHAIN_CONFIG];
  const toConfig = CHAIN_CONFIG[toChainId as keyof typeof CHAIN_CONFIG];
  const displayAmount = parseFloat(amount || "0").toFixed(2);
  const fromName = fromConfig?.shortName ?? "?";
  const toName = toConfig?.shortName ?? "?";

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: "#07091A",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background glows */}
        <div style={{ position: "absolute", top: px(-300), left: px(-200), width: px(900), height: px(900), borderRadius: "50%", display: "flex", background: "radial-gradient(circle, rgba(107,92,231,0.35) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: px(-250), right: px(-100), width: px(800), height: px(800), borderRadius: "50%", display: "flex", background: "radial-gradient(circle, rgba(0,179,134,0.28) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: `${px(80)}px ${px(80)}px` }} />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${px(44)}px ${px(80)}px 0` }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(12) }}>
            <span style={{ fontSize: px(18), fontWeight: 800, color: "#C4B8FF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Arc Bridge
            </span>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(107,92,231,0.20)", border: "1px solid rgba(107,92,231,0.40)", borderRadius: px(999), padding: `${px(4)}px ${px(14)}px` }}>
              <span style={{ fontSize: px(11), fontWeight: 700, color: "#9B8FE8", letterSpacing: "0.10em" }}>TESTNET</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: px(8), background: "rgba(0,179,134,0.12)", border: "1px solid rgba(0,179,134,0.30)", borderRadius: px(999), padding: `${px(8)}px ${px(20)}px` }}>
            <div style={{ width: px(8), height: px(8), borderRadius: "50%", background: "#00C896", display: "flex" }} />
            <span style={{ fontSize: px(13), fontWeight: 700, color: "#00C896", letterSpacing: "0.06em" }}>COMPLETE</span>
          </div>
        </div>

        {/* Center: full-width hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: `0 ${px(80)}px`, gap: px(36) }}>
          {/* Label */}
          <span style={{ fontSize: px(15), fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Successfully Bridged
          </span>

          {/* Amount */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: px(24) }}>
            <span style={{ fontSize: px(148), fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {displayAmount}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: px(14), paddingBottom: px(14) }}>
              <UsdcLogo size={px(56)} />
              <span style={{ fontSize: px(44), fontWeight: 800, color: "#2775CA", letterSpacing: "0.02em" }}>
                USDC
              </span>
            </div>
          </div>

          {/* Chain route */}
          <div style={{ display: "flex", alignItems: "center", gap: px(20) }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: px(16), padding: `${px(12)}px ${px(30)}px` }}>
              <span style={{ fontSize: px(24), fontWeight: 700, color: "#D0D8F0" }}>{fromName}</span>
            </div>
            <svg viewBox="0 0 56 16" width={px(56)} height={px(16)} style={{ display: "flex", overflow: "visible" }}>
              <path d="M0 8 L44 8 M36 2 L48 8 L36 14" fill="none" stroke="#5B7CF7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,179,134,0.10)", border: "1px solid rgba(0,179,134,0.25)", borderRadius: px(16), padding: `${px(12)}px ${px(30)}px` }}>
              <span style={{ fontSize: px(24), fontWeight: 700, color: "#00C896" }}>{toName}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", padding: `0 ${px(80)}px ${px(44)}px` }}>
          <span style={{ fontSize: px(13), color: "rgba(255,255,255,0.25)" }}>via Circle CCTP V2 · native USDC, no wrapped tokens</span>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
