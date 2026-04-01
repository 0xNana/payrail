"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Address, formatUnits, type PublicClient, type WalletClient } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";

import type { Locale } from "@/i18n-config";
import { tryGetContracts } from "@/lib/contracts";
import { getEmployeePayrollBindings, type EmployeePayrollBinding } from "@/lib/supabasePayroll";
import { targetPayrollChain } from "@/lib/targetChain";

const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

type EmployeePayrollContextValue = {
  lang: Locale;
  address?: Address;
  chainId?: number;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
  contracts: ReturnType<typeof tryGetContracts>;
  selectedPayroll: Address | "";
  setSelectedPayroll: (addr: Address | "") => void;
  bindings: EmployeePayrollBinding[];
  bindingsLoading: boolean;
  bindingsError: string | null;
  tokenSymbol: string;
  tokenDecimals: number;
  lastRunId?: string;
  resetSelectionData: () => void;
};

const EmployeePayrollContext = createContext<EmployeePayrollContextValue | undefined>(undefined);

export function EmployeePayrollProvider({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: targetPayrollChain.id });
  const { data: walletClient } = useWalletClient();

  const [selectedPayroll, setSelectedPayroll] = useState<Address | "">("");
  const [bindings, setBindings] = useState<EmployeePayrollBinding[]>([]);
  const [bindingsLoading, setBindingsLoading] = useState(false);
  const [bindingsError, setBindingsError] = useState<string | null>(null);

  const me = address as Address | undefined;
  const contracts = tryGetContracts(targetPayrollChain.id);
  const payrollAddr = selectedPayroll || undefined;

  useEffect(() => {
    if (!me || !chainId) return;
    setBindingsLoading(true);
    setBindingsError(null);
    getEmployeePayrollBindings({ employeeWalletAddress: me, chainId })
      .then((data) => {
        setBindings(data);
        if (data.length === 1) {
          setSelectedPayroll(data[0].payroll_contract_address);
        }
      })
      .catch((err) => {
        setBindingsError(err instanceof Error ? err.message : "Failed to load payroll bindings");
      })
      .finally(() => {
        setBindingsLoading(false);
      });
  }, [me, chainId]);

  const { data: tokenSymbol } = useReadContract({
    address: contracts?.PayrailToken.address,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: targetPayrollChain.id,
    query: { enabled: !!contracts },
  });

  const { data: tokenDecimals } = useReadContract({
    address: contracts?.PayrailToken.address,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: targetPayrollChain.id,
    query: { enabled: !!contracts },
  });

  const { data: lastRunIdData } = useReadContract({
    address: payrollAddr,
    abi: contracts?.PayrailAbi,
    functionName: "myLastRunId",
    account: me,
    chainId: targetPayrollChain.id,
    query: { enabled: !!contracts && !!payrollAddr && !!me },
  });

  return (
    <EmployeePayrollContext.Provider
      value={{
        lang,
        address: me,
        chainId,
        publicClient,
        walletClient: walletClient ?? undefined,
        contracts,
        selectedPayroll,
        setSelectedPayroll,
        bindings,
        bindingsLoading,
        bindingsError,
        tokenSymbol: tokenSymbol ?? "Encrypted Payroll Token",
        tokenDecimals: tokenDecimals ?? 18,
        lastRunId: lastRunIdData !== undefined && lastRunIdData !== null ? String(lastRunIdData) : undefined,
        resetSelectionData: () => undefined,
      }}
    >
      {children}
    </EmployeePayrollContext.Provider>
  );
}

export function useEmployeePayrollContext() {
  const context = useContext(EmployeePayrollContext);
  if (!context) {
    throw new Error("useEmployeePayrollContext must be used within EmployeePayrollProvider");
  }
  return context;
}

export function formatEmployeeTokenAmount(value: bigint | null, decimals: number) {
  if (value === null) return null;
  return formatUnits(value, decimals);
}
