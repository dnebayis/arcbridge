"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { fetchCCTPHistory, type CCTPBridgeTx } from "@/lib/explorer";

export interface UseCCTPHistoryReturn {
  transactions: CCTPBridgeTx[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastFetched: Date | null;
}

export function useCCTPHistory(
  etherscanApiKey: string = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || ""
): UseCCTPHistoryReturn {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<CCTPBridgeTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    if (!address || !isConnected) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const txs = await fetchCCTPHistory(address, etherscanApiKey);
      setTransactions(txs);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, etherscanApiKey]);

  // Cüzdan bağlandığında otomatik çek
  useEffect(() => {
    if (isConnected && address) {
      fetch();
    } else {
      setTransactions([]);
      setLastFetched(null);
    }
  }, [address, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  return { transactions, loading, error, refresh: fetch, lastFetched };
}
