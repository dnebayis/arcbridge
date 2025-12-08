import React, { useEffect, useMemo, useState, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectorClient, useAccount, useSwitchChain } from "wagmi";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { BridgeKit } from "@circle-fin/bridge-kit";
import "./App.css";

type SupportedChainItem = { chain: string; name: string; type: string; chainId?: number };

export default function App() {
  const { data: client } = useConnectorClient();
  const { connector } = useAccount();
  const [resolvedProvider, setResolvedProvider] = useState<any>(null);
  const { switchChain } = useSwitchChain();
  const [supportedChains, setSupportedChains] = useState<SupportedChainItem[]>([]);
  const [fromChain, setFromChain] = useState<string>("");
  const [toChain, setToChain] = useState<string>("");
  const [amount, setAmount] = useState<string>("10.00");
  const [recipient, setRecipient] = useState<string>("");
  const [estimating, setEstimating] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; title: string; message: React.ReactNode } | null>(null);
  const [error, setError] = useState<string>("");
  const [progressSteps, setProgressSteps] = useState<any[]>([]);
  
  // Track bridge start time for simulated progress
  const [bridgeStartTime, setBridgeStartTime] = useState<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const safeStringify = (obj: any) =>
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2);

  const kit = useMemo(() => new BridgeKit(), []);

  // Helper to get Explorer URL
  const getExplorerUrl = (chain: string, txHash: string) => {
    if (chain === "Ethereum_Sepolia") {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
    if (chain === "Arc_Testnet") {
      return `https://testnet.arcscan.app/tx/${txHash}`;
    }
    // Fallback generic EVM-like URL or just return hash if unknown
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const chains = await kit.getSupportedChains();
        const evmChains = chains.filter((c: any) => c.type === "evm");
        const mappedAll = evmChains.map((c: any) => ({ chain: c.chain, name: c.name, type: c.type, chainId: c.chainId }));
        const mapped = mappedAll.filter((c: any) =>
          ["Ethereum_Sepolia", "Arc_Testnet"].includes(c.chain)
        );
        if (!mounted) return;
        setSupportedChains(mapped);
        const sepolia = mapped.find((c) => c.chain === "Ethereum_Sepolia");
        const arc = mapped.find((c) => c.chain === "Arc_Testnet");
        setFromChain(sepolia?.chain || mapped[0]?.chain || "");
        setToChain(arc?.chain || mapped[1]?.chain || "");
      } catch (e) { /* no-op */ }
    })();
    return () => { mounted = false; };
  }, [kit]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p1 = (client as any)?.transport?.value?.provider;
        if (p1) {
          if (active) setResolvedProvider(p1);
          return;
        }
        const maybePromise = (connector as any)?.getProvider?.();
        const p2 = maybePromise && typeof maybePromise.then === "function" ? await maybePromise : maybePromise;
        if (active) setResolvedProvider(p2 || null);
      } catch {
        if (active) setResolvedProvider(null);
      }
    })();
    return () => { active = false; };
  }, [client, connector]);

  // Progress Loop
  useEffect(() => {
    if (bridging && bridgeStartTime) {
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - bridgeStartTime;
        
        setProgressSteps(prev => {
          // Don't update if we're in a terminal state (error/completed)
          const currentStatus = prev.find(s => s.status === "error" || (s.name === "Mint" && s.status === "completed"));
          if (currentStatus) return prev;

          return prev.map(step => {
            // Approve: 0-4s
            if (step.name === "Approve") {
              if (elapsed < 4000) return { ...step, status: "active" };
              return { ...step, status: "completed" };
            }
            // Burn: 4s-12s
            if (step.name === "Burn") {
              if (elapsed >= 4000 && elapsed < 12000) return { ...step, status: "active" };
              if (elapsed >= 12000) return { ...step, status: "completed" };
              return { ...step, status: "idle" };
            }
            // Attestation: 12s-25s
            if (step.name === "Attestation") {
              if (elapsed >= 12000 && elapsed < 25000) return { ...step, status: "active" };
              if (elapsed >= 25000) return { ...step, status: "completed" };
              return { ...step, status: "idle" };
            }
            // Mint: 25s+
            if (step.name === "Mint") {
              if (elapsed >= 25000) return { ...step, status: "active" };
              return { ...step, status: "idle" };
            }
            return step;
          });
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [bridging, bridgeStartTime]);

  const canBridge = resolvedProvider && fromChain && toChain && amount && fromChain !== toChain;

  async function onEstimate() {
    setError("");
    setEstimating(true);
    setEstimate(null);
    setProgressSteps([]); 
    try {
      if (!resolvedProvider) throw new Error("Wallet not connected");
      if (!fromChain || !toChain) throw new Error("Select both source and destination chains");
      const fromInfo = supportedChains.find((c) => c.chain === fromChain);
      if (fromInfo?.chainId && typeof switchChain === "function") {
        try { await (switchChain as any)({ chainId: fromInfo.chainId }); } catch { /* ignore */ }
      }
      const adapter = await createAdapterFromProvider({ provider: resolvedProvider });
      const toCtx = recipient
        ? { adapter, chain: toChain as any, recipientAddress: recipient }
        : { adapter, chain: toChain as any };
      const res = await kit.estimate({
        from: { adapter, chain: fromChain as any },
        to: toCtx as any,
        amount,
        config: { transferSpeed: "FAST" },
      });
      setEstimate(res);
    } catch (e: any) {
      const msg = e?.message || String(e);
      const low = String(msg).toLowerCase();
      const friendly = low.includes("mint step failed")
        ? "Destination chain mint failed. Add native gas and retry."
        : msg;
      setError(friendly);
    } finally {
      setEstimating(false);
    }
  }

  async function onBridge() {
    setError("");
    setBridging(true);
    setBridgeStartTime(Date.now()); // Start timer
    
    // Initialize steps
    setProgressSteps([
      { name: "Approve", status: "active", description: "Approve token transfer" },
      { name: "Burn", status: "idle", description: "Burn tokens on source chain" },
      { name: "Attestation", status: "idle", description: "Wait for CCTP attestation" },
      { name: "Mint", status: "idle", description: "Mint tokens on destination chain" }
    ]);
    
    try {
      if (!resolvedProvider) throw new Error("Wallet not connected");
      if (!fromChain || !toChain) throw new Error("Select both source and destination chains");
      const fromInfo = supportedChains.find((c) => c.chain === fromChain);
      if (fromInfo?.chainId && typeof switchChain === "function") {
        try { await (switchChain as any)({ chainId: fromInfo.chainId }); } catch { /* ignore */ }
      }
      const adapter = await createAdapterFromProvider({ provider: resolvedProvider });
      const toCtx = recipient
        ? { adapter, chain: toChain as any, recipientAddress: recipient }
        : { adapter, chain: toChain as any };
        
      const res = await kit.bridge({
        from: { adapter, chain: fromChain as any },
        to: toCtx as any,
        amount,
        config: { transferSpeed: "FAST" },
      });
      
      const steps = (res as any)?.steps || [];
      const hasError = steps.some((s: any) => s.state === "error" || s.state === "failed");
      const failedStep = steps.find((s: any) => s.state === "error" || s.state === "failed");

      if (hasError) {
        const errorMsg = failedStep?.error?.message || "Transaction failed.";
        throw new Error(errorMsg);
      }

      const txHash = steps?.[0]?.txHash;
      if (!txHash) {
        // If no hash and no explicit error, assume cancelled or init failure
        throw new Error("User rejected transaction or initialization failed.");
      }

      // Success: Mark all completed
      setProgressSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
      
      const explorerUrl = getExplorerUrl(fromChain, txHash);

      setToast({
        type: "success",
        title: "Bridge Successful",
        message: (
          <span>
            Transaction Hash:{" "}
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: "var(--accent-primary)", textDecoration: "underline" }}
            >
              {txHash.slice(0, 10)}...
            </a>
          </span>
        )
      });
    } catch (e: any) {
      const msg = e?.message || String(e);
      const low = String(msg).toLowerCase();
      
      // Cancelled
      if (low.includes("user rejected") || low.includes("user denied") || low.includes("rejected transaction")) {
         setToast({
          type: "warning",
          title: "Transaction Cancelled",
          message: "You rejected the transaction in your wallet."
        });
        // Mark currently active step as error
        setProgressSteps(prev => prev.map(s => s.status === "active" ? { ...s, status: "error" } : s));
        return; 
      }

      const friendly = low.includes("mint step failed")
        ? "Destination chain mint failed. Add native gas and retry."
        : msg;
      
      setError(friendly);
      setToast({
        type: "error",
        title: "Bridge Failed",
        message: friendly
      });
      // Mark currently active step as error
      setProgressSteps(prev => prev.map(s => s.status === "active" ? { ...s, status: "error" } : s));
    } finally {
      setBridging(false);
      setBridgeStartTime(null); // Stop timer
    }
  }

  const switchChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  return (
    <div className="app-layout">
      <div className="main-column">
        {/* Header */}
        <header className="app-header">
          <a href="https://www.arc.network/" target="_blank" rel="noopener noreferrer" className="brand-logo">ARC BRIDGE</a>
          <div className="header-actions">
            <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
          </div>
        </header>

        {/* Main Card */}
        <div className="bridge-card">
          <div className="bridge-content">
            {/* From Section */}
            <div className="input-group">
              <div className="label-row">
                <span>From</span>
                <span>Balance: --</span>
              </div>
              <div className="input-row">
                <input
                  className="amount-input"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="chain-selector">
                  {supportedChains.find(c => c.chain === fromChain)?.name || "Select"}
                </button>
              </div>
            </div>

            {/* Switch Arrow */}
            <div className="swap-separator">
              <button className="arrow-circle" onClick={switchChains}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </button>
            </div>

            {/* To Section */}
            <div className="input-group">
              <div className="label-row">
                <span>To</span>
              </div>
              <div className="input-row">
                <input
                  className="amount-input"
                  placeholder="0"
                  value={amount} // Read-only reflection of amount
                  readOnly
                  style={{ color: "var(--text-secondary)" }}
                />
                <button className="chain-selector">
                  {supportedChains.find(c => c.chain === toChain)?.name || "Select"}
                </button>
              </div>
            </div>

            {/* Settings / Extra Inputs */}
            <div className="settings-section">
              <div className="setting-row">
                <div className="small-input-group">
                    <label className="small-label">Recipient Address (Optional)</label>
                    <input 
                      className="small-input" 
                      placeholder="0x..." 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                </div>
              </div>
            </div>

            {/* Action Button */}
            {estimate ? (
              <button 
                className="action-btn"
                onClick={onBridge}
                disabled={!canBridge || bridging}
              >
                {bridging ? "Bridging..." : "Confirm Bridge"}
              </button>
            ) : (
              <button 
                className="action-btn"
                onClick={onEstimate}
                disabled={!canBridge || estimating}
              >
                {estimating ? "Calculating..." : "Review Bridge"}
              </button>
            )}

            {error && <div className="error-banner">{error}</div>}
          </div>
        </div>

        {/* Details / Estimate View */}
        {estimate && (
          <div className="details-card">
            <div className="details-header">Transaction Details</div>
            {(["Approve", "Burn", "Mint"] as const).map((stepName) => {
              const step = Array.isArray((estimate as any)?.gasFees)
                ? (estimate as any).gasFees.find((g: any) => g?.name === stepName)
                : undefined;
              if (!step) return null;
              return (
                <div key={stepName} className="step-row">
                  <span className="step-label">{stepName} Gas ({step.blockchain})</span>
                  <span className="step-val">~{step.fees?.fee || "0"} USDC</span>
                </div>
              );
            })}
            {Array.isArray((estimate as any)?.fees) && (estimate as any).fees.map((f: any, i: number) => (
              <div key={i} className="step-row">
                <span className="step-label">{f?.type || "Fee"}</span>
                <span className="step-val">{f?.amount} {f?.token}</span>
              </div>
            ))}
          </div>
        )}

        <footer className="app-footer">
          <div className="footer-content">
            <a href="https://www.arc.network/" target="_blank" rel="noopener noreferrer" className="footer-link project-link">Arc Network</a>
            <span className="footer-separator">|</span>
            <span className="built-by">Built by</span>
            <a href="https://x.com/0xshawtyy" target="_blank" rel="noopener noreferrer" className="footer-link twitter-link">@0xshawtyy</a>
          </div>
        </footer>
      </div>

      {/* Right Sidebar: Progress Steps */}
      {progressSteps.length > 0 && (
        <div className="progress-sidebar">
          <div className="sidebar-title">Bridge Progress</div>
          {progressSteps.map((step, idx) => (
            <div key={idx} className={`progress-step step-${step.status}`}>
              <div className="step-icon">
                {step.status === "completed" ? "✓" : step.status === "error" ? "!" : step.status === "active" ? "➤" : "•"}
              </div>
              <div className="step-content">
                <div className="step-title">{step.name}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Container */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === "success" ? "toast-success" : toast.type === "warning" ? "toast-warning" : "toast-error"}`}>
            <div className="toast-icon">
              {toast.type === "success" ? "✓" : "!"}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
