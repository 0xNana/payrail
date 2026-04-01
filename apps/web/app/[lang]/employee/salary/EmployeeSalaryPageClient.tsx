"use client";

import { useEffect, useState } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";

import { EmployeeSalary } from "@/components/employee/EmployeeSalary";
import { tryGetContracts } from "@/lib/contracts";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
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

export function EmployeeSalaryPageClient({ lang }: { lang: Locale }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: targetPayrollChain.id });
  const { data: walletClient } = useWalletClient();
  const t = useDictionary(lang);

  const [selectedPayroll, setSelectedPayroll] = useState<Address | "">("");
  const [bindings, setBindings] = useState<EmployeePayrollBinding[]>([]);
  const [bindingsLoading, setBindingsLoading] = useState(false);
  const [bindingsError, setBindingsError] = useState<string | null>(null);
  const [salaryPlain, setSalaryPlain] = useState<bigint | null>(null);
  const [salaryFormatted, setSalaryFormatted] = useState<string | null>(null);
  const [salaryHandle, setSalaryHandle] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const me = address as Address | undefined;
  const contracts = tryGetContracts(targetPayrollChain.id);

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
    address: selectedPayroll && contracts ? contracts.PayrailToken.address : undefined,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: targetPayrollChain.id,
  });

  const { data: tokenDecimals } = useReadContract({
    address: selectedPayroll && contracts ? contracts.PayrailToken.address : undefined,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: targetPayrollChain.id,
  });

  const onDecryptSalary = async () => {
    if (!publicClient || !walletClient || !me || !selectedPayroll || !contracts) return;
    try {
      const { decryptUint64 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting salary...");
      const handle = await publicClient.readContract({
        address: selectedPayroll,
        abi: contracts.PayrailAbi,
        functionName: "mySalary",
        args: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        account: me,
      });
      setSalaryHandle(String(handle));
      const result = await decryptUint64({
        chainId: targetPayrollChain.id,
        publicClient,
        walletClient,
        account: me,
        handle: handle as `0x${string}`,
      });
      setSalaryPlain(result);
      setSalaryFormatted(formatUnits(result, tokenDecimals ?? 18));
      setStatus("✅ Salary decrypted successfully!");
    } catch (err) {
      setStatus(`❌ Failed to decrypt salary: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const onSelectPayroll = (addr: Address | "") => {
    setSelectedPayroll(addr);
    setSalaryPlain(null);
    setSalaryFormatted(null);
    setSalaryHandle(null);
  };

  if (!t) return null;

  return (
    <EmployeeSalary
      locale={lang}
      chainId={chainId}
      canUseFhe={chainId === targetPayrollChain.id && !!contracts}
      tokenSymbol={tokenSymbol ?? "Encrypted Payroll Token"}
      tokenDecimals={tokenDecimals ?? 18}
      underlyingAddr={contracts?.PayrailToken.address}
      bindings={bindings}
      bindingsLoading={bindingsLoading}
      bindingsError={bindingsError}
      selectedPayroll={selectedPayroll}
      onSelectPayroll={onSelectPayroll}
      salaryHandle={salaryHandle ?? undefined}
      salaryPlain={salaryPlain}
      salaryFormatted={salaryFormatted}
      onDecryptSalary={onDecryptSalary}
      status={status}
    />
  );
}
