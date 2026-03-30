"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TARGET_PAYROLL_CHAIN_ID, TARGET_PAYROLL_CHAIN_NAME, targetPayrollChain } from "@/lib/targetChain";

function chainName(chainId: number) {
  switch (chainId) {
    case TARGET_PAYROLL_CHAIN_ID:
      return TARGET_PAYROLL_CHAIN_NAME;
    case 31337:
      return "Localhost (Hardhat)";
    case 1:
      return "Ethereum Mainnet";
    case 137:
      return "Polygon";
    default:
      return `Unknown (${chainId})`;
  }
}

export function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();

  // Optional: read the real injected chainId from window.ethereum (helps debug “stuck” states)
  const [injectedChainId, setInjectedChainId] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setInjectedChainId(null);
      return;
    }

    const eth = (window as any).ethereum;
    if (!eth?.request) return;

    async function refresh() {
      try {
        const hex = await eth.request({ method: "eth_chainId" });
        setInjectedChainId(parseInt(hex, 16));
      } catch {
        // ignore
      }
    }

    refresh();

    // keep in sync when the wallet changes networks
    const onChainChanged = () => refresh();
    eth.on?.("chainChanged", onChainChanged);

    return () => {
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, [isConnected]);

  if (!isConnected) return null;

  const onTargetChain = chainId === targetPayrollChain.id;

  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
        display: "grid",
        gap: 6,
        maxWidth: 720,
      }}
    >
      <div>
        <b>Network</b>: {chainName(chainId)} — <b>chainId</b>: {chainId}
        {!onTargetChain && <span style={{ color: "crimson" }}> (Wrong network)</span>}
      </div>

      {injectedChainId !== null && injectedChainId !== chainId && (
        <div style={{ color: "crimson" }}>
          ⚠️ Wallet/provider chain differs: injected={injectedChainId} vs wagmi={chainId}
        </div>
      )}

      {!onTargetChain && (
        <button
          onClick={() => switchChainAsync({ chainId: targetPayrollChain.id })}
          disabled={isPending}
          style={{ width: "fit-content" }}
        >
          Switch to {TARGET_PAYROLL_CHAIN_NAME}
        </button>
      )}
    </div>
  );
}

export default NetworkStatus;
