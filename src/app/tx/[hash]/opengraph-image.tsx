import { generateReceiptImage } from "@/lib/receiptImage";

export const runtime = "edge";
export const alt = "Arc Bridge — Transaction";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ from?: string; to?: string; amount?: string }>;
}

export default async function TxOgImage({ params, searchParams }: Props) {
  const { hash } = await params;
  const { from, to, amount } = await searchParams;

  return generateReceiptImage({
    hash,
    fromChainId: parseInt(from ?? "0"),
    toChainId: parseInt(to ?? "0"),
    amount: amount ?? "0",
  });
}
