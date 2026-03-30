"use client";

import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { formatUnits } from "viem";
import { useMemo } from "react";
import { useAccount, useChainId, useConnect, useDisconnect, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tryGetContracts } from "@/lib/contracts";

export function Connect() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const contracts = useMemo(() => tryGetContracts(chainId), [chainId]);

  const token = contracts?.PayrailToken;

  const balance = useReadContract(
    token && address
      ? {
          address: token.address,
          abi: token.abi,
          functionName: "balanceOf",
          args: [address],
        }
      : undefined
  );

  const decimals = useReadContract(
    token
      ? {
          address: token.address,
          abi: token.abi,
          functionName: "decimals",
        }
      : undefined
  );

  const symbol = useReadContract(
    token
      ? {
          address: token.address,
          abi: token.abi,
          functionName: "symbol",
        }
      : undefined
  );

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const balanceLabel =
    balance.data !== undefined
      ? Number(formatUnits(balance.data as bigint, Number(decimals.data ?? 6))).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";
  const symbolLabel = typeof symbol.data === "string" ? symbol.data : "USDC";

  if (!isConnected) {
    return (
      <Button onClick={() => connect({ connector: connectors[0] })} disabled={isPending || !connectors.length}>
        {isPending ? "Connecting..." : "Login"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[124px] justify-between gap-2">
          <span>Account</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-border/80 p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Wallet</div>
          <div className="mt-2 font-mono text-sm text-foreground">{truncatedAddress}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Balance</div>
                <div className="text-sm text-foreground">{symbolLabel}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold tracking-tight text-foreground">{balanceLabel}</div>
              <div className="text-xs text-muted-foreground">{symbolLabel}</div>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="rounded-xl px-3 py-2.5" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Connect;
