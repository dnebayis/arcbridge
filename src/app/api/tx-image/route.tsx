import { NextRequest } from "next/server";
import { generateReceiptImage } from "@/lib/receiptImage";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const hash = searchParams.get("hash") ?? "";
  const fromChainId = parseInt(searchParams.get("from") ?? "0");
  const toChainId = parseInt(searchParams.get("to") ?? "0");
  const amount = searchParams.get("amount") ?? "0";

  const image = generateReceiptImage({ hash, fromChainId, toChainId, amount });

  const headers = new Headers(image.headers);
  headers.set(
    "Content-Disposition",
    `attachment; filename="arc-bridge-${hash.slice(0, 8)}.png"`
  );
  return new Response(image.body, { status: image.status, headers });
}
