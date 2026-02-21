import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Arc Bridge — USDC Cross-Chain Transfer",
  description: "Bridge USDC between Arc Testnet and Ethereum Sepolia using Circle CCTP V2",
  openGraph: {
    title: "Arc Bridge — USDC Cross-Chain Transfer",
    description: "Native USDC transfers via Circle CCTP V2 — no wrapped tokens",
    siteName: "Arc Bridge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arc Bridge — USDC Cross-Chain Transfer",
    description: "Native USDC transfers via Circle CCTP V2 — no wrapped tokens",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ background: "#080C18", color: "#F0F2F8" }}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
