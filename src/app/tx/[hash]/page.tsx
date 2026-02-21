import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TxSharePage } from "@/components/bridge/TxSharePage";
import { CHAIN_CONFIG } from "@/lib/chains";

// Burn hash'ten hangi chain'e ait olduğunu URL param ile taşıyacağız.
// URL: /tx/{burnTxHash}?from={chainId}&to={chainId}&amount={amount}

interface Props {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ from?: string; to?: string; amount?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { hash } = await params;
  const { from, to, amount } = await searchParams;

  const fromChainId = parseInt(from ?? "0");
  const toChainId = parseInt(to ?? "0");
  const fromConfig = CHAIN_CONFIG[fromChainId as keyof typeof CHAIN_CONFIG];
  const toConfig = CHAIN_CONFIG[toChainId as keyof typeof CHAIN_CONFIG];

  if (!fromConfig || !toConfig) {
    return { title: "Arc Bridge — Transaction" };
  }

  const title = `${amount ?? "?"} USDC bridged: ${fromConfig.shortName} → ${toConfig.shortName}`;
  const description = `Bridge transaction via Arc Bridge (Circle CCTP V2). Burn tx: ${hash.slice(0, 10)}...`;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://arc-bridge.vercel.app"
    ),
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Arc Bridge",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TxPage({ params, searchParams }: Props) {
  const { hash } = await params;
  const { from, to, amount } = await searchParams;

  if (!hash || !from || !to || !amount) notFound();

  const fromChainId = parseInt(from);
  const toChainId = parseInt(to);

  if (
    !CHAIN_CONFIG[fromChainId as keyof typeof CHAIN_CONFIG] ||
    !CHAIN_CONFIG[toChainId as keyof typeof CHAIN_CONFIG]
  ) {
    notFound();
  }

  return (
    <TxSharePage
      burnTxHash={hash}
      fromChainId={fromChainId as keyof typeof CHAIN_CONFIG}
      toChainId={toChainId as keyof typeof CHAIN_CONFIG}
      amount={amount}
    />
  );
}
