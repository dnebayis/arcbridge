import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Arc Bridge — USDC Cross-Chain Transfer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080C18",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple orb top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,92,231,0.35) 0%, transparent 70%)",
          }}
        />
        {/* Blue orb top-right */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,111,212,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Bottom orb */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,92,231,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            padding: "56px 72px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Sepolia → Arc flow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* From */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(98,126,234,0.2)",
                  border: "2px solid rgba(98,126,234,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                ⟠
              </div>
              <span style={{ color: "#6B7A99", fontSize: 16, fontWeight: 500 }}>
                Sepolia
              </span>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 2,
                  background:
                    "linear-gradient(90deg, #6B5CE7 0%, #4B7CF7 100%)",
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "#6B5CE7",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                CCTP V2
              </span>
            </div>

            {/* To */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(0,179,134,0.2)",
                  border: "2px solid rgba(0,179,134,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                ◎
              </div>
              <span style={{ color: "#6B7A99", fontSize: 16, fontWeight: 500 }}>
                Arc Testnet
              </span>
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h1
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#F0F2F8",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Arc Bridge
            </h1>
            <p
              style={{
                fontSize: 20,
                color: "#6B7A99",
                margin: 0,
                textAlign: "center",
              }}
            >
              Native USDC transfers via Circle CCTP V2
            </p>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 12 }}>
            {["No wrapped tokens", "Instant finality", "Testnet"].map(
              (badge) => (
                <div
                  key={badge}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    background: "rgba(107,92,231,0.15)",
                    border: "1px solid rgba(107,92,231,0.3)",
                    color: "#A89CF7",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
