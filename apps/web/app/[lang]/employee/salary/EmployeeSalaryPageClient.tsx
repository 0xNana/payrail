"use client";

import { useState } from "react";
import { type Address } from "viem";

import { EmployeeSalary } from "@/components/employee/EmployeeSalary";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
import { targetPayrollChain } from "@/lib/targetChain";
import {
  formatEmployeeTokenAmount,
  useEmployeePayrollContext,
} from "../EmployeePayrollContext";

export function EmployeeSalaryPageClient({ lang }: { lang: Locale }) {
  const t = useDictionary(lang);
  const payroll = useEmployeePayrollContext();
  const [salaryPlain, setSalaryPlain] = useState<bigint | null>(null);
  const [salaryFormatted, setSalaryFormatted] = useState<string | null>(null);
  const [salaryHandle, setSalaryHandle] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const onDecryptSalary = async () => {
    if (!payroll.publicClient || !payroll.walletClient || !payroll.address || !payroll.selectedPayroll || !payroll.contracts) return;
    try {
      const { decryptUint64 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting salary...");
      const handle = await payroll.publicClient.readContract({
        address: payroll.selectedPayroll,
        abi: payroll.contracts.PayrailAbi,
        functionName: "mySalary",
        args: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        account: payroll.address,
      });
      setSalaryHandle(String(handle));
      const result = await decryptUint64({
        chainId: targetPayrollChain.id,
        publicClient: payroll.publicClient,
        walletClient: payroll.walletClient,
        account: payroll.address,
        handle: handle as `0x${string}`,
      });
      setSalaryPlain(result);
      setSalaryFormatted(formatEmployeeTokenAmount(result, payroll.tokenDecimals));
      setStatus("✅ Salary decrypted successfully!");
    } catch (err) {
      setStatus(`❌ Failed to decrypt salary: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const onSelectPayroll = (addr: Address | "") => {
    payroll.setSelectedPayroll(addr);
    setSalaryPlain(null);
    setSalaryFormatted(null);
    setSalaryHandle(null);
  };

  if (!t) return null;

  return (
    <EmployeeSalary
      locale={lang}
      chainId={payroll.chainId}
      canUseFhe={payroll.chainId === targetPayrollChain.id && !!payroll.contracts}
      tokenSymbol={payroll.tokenSymbol}
      tokenDecimals={payroll.tokenDecimals}
      underlyingAddr={payroll.contracts?.PayrailToken.address}
      bindings={payroll.bindings}
      bindingsLoading={payroll.bindingsLoading}
      bindingsError={payroll.bindingsError}
      selectedPayroll={payroll.selectedPayroll}
      onSelectPayroll={onSelectPayroll}
      salaryHandle={salaryHandle ?? undefined}
      salaryPlain={salaryPlain}
      salaryFormatted={salaryFormatted}
      onDecryptSalary={onDecryptSalary}
      status={status}
    />
  );
}
