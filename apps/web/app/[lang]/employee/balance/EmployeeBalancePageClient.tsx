"use client";

import { useState } from "react";
import { type Address } from "viem";

import { EmployeeBalance } from "@/components/employee/EmployeeBalance";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
import { targetPayrollChain } from "@/lib/targetChain";
import {
  formatEmployeeTokenAmount,
  useEmployeePayrollContext,
} from "../EmployeePayrollContext";

export function EmployeeBalancePageClient({ lang }: { lang: Locale }) {
  const t = useDictionary(lang);
  const payroll = useEmployeePayrollContext();

  const [lastPaymentPlain, setLastPaymentPlain] = useState<bigint | null>(null);
  const [lastPaymentFormatted, setLastPaymentFormatted] = useState<string | null>(null);
  const [balancePlain, setBalancePlain] = useState<bigint | null>(null);
  const [balanceFormatted, setBalanceFormatted] = useState<string | null>(null);
  const [balanceHandle, setBalanceHandle] = useState<string | null>(null);
  const [lastPaymentHandle, setLastPaymentHandle] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const onDecryptBalance = async () => {
    if (!payroll.walletClient || !payroll.address || !payroll.publicClient || !payroll.contracts) return;
    try {
      const { decryptUint128 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting balance...");
      const handle = await payroll.publicClient.readContract({
        address: payroll.contracts.PayrailToken.address,
        abi: payroll.contracts.PayrailToken.abi,
        functionName: "balanceOfEncrypted",
        args: [payroll.address],
        account: payroll.address,
      });
      setBalanceHandle(String(handle));
      const result = await decryptUint128({
        chainId: targetPayrollChain.id,
        publicClient: payroll.publicClient,
        walletClient: payroll.walletClient,
        account: payroll.address,
        handle: handle as `0x${string}`,
      });
      setBalancePlain(result);
      setBalanceFormatted(formatEmployeeTokenAmount(result, payroll.tokenDecimals));
      setStatus("✅ Balance decrypted successfully!");
    } catch (err) {
      setStatus(`❌ Failed to decrypt balance: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const onDecryptLastPayment = async () => {
    if (!payroll.publicClient || !payroll.walletClient || !payroll.address || !payroll.selectedPayroll || !payroll.contracts) return;
    try {
      const { decryptUint64 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting last payment...");
      const handle = await payroll.publicClient.readContract({
        address: payroll.selectedPayroll,
        abi: payroll.contracts.PayrailAbi,
        functionName: "myLastPayment",
        args: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        account: payroll.address,
      });
      setLastPaymentHandle(String(handle));
      const result = await decryptUint64({
        chainId: targetPayrollChain.id,
        publicClient: payroll.publicClient,
        walletClient: payroll.walletClient,
        account: payroll.address,
        handle: handle as `0x${string}`,
      });
      setLastPaymentPlain(result);
      setLastPaymentFormatted(formatEmployeeTokenAmount(result, payroll.tokenDecimals));
      setStatus("✅ Last payment decrypted successfully!");
    } catch (err) {
      setStatus(`❌ Failed to decrypt last payment: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const onRequestUnwrap = async (amountRaw: bigint, toAddress: Address) => {
    setIsUnwrapping(true);
    try {
      void amountRaw;
      void toAddress;
      setStatus("ℹ️ Payrail balances stay encrypted on-chain. Public token unwrap is not available in the CoFHE runtime.");
    } catch (err) {
      setStatus(`❌ Unwrap failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsUnwrapping(false);
    }
  };

  const onSelectPayroll = (addr: Address | "") => {
    payroll.setSelectedPayroll(addr);
    setBalancePlain(null);
    setBalanceFormatted(null);
    setBalanceHandle(null);
    setLastPaymentPlain(null);
    setLastPaymentFormatted(null);
    setLastPaymentHandle(null);
  };

  if (!t) return null;

  return (
    <EmployeeBalance
      locale={lang}
      chainId={payroll.chainId}
      canUseFhe={payroll.chainId === targetPayrollChain.id && !!payroll.contracts}
      tokenSymbol={payroll.tokenSymbol}
      tokenDecimals={payroll.tokenDecimals}
      underlyingAddr={payroll.contracts?.PayrailToken.address}
      userAddress={payroll.address}
      bindings={payroll.bindings}
      bindingsLoading={payroll.bindingsLoading}
      bindingsError={payroll.bindingsError}
      selectedPayroll={payroll.selectedPayroll}
      onSelectPayroll={onSelectPayroll}
      lastPaymentHandle={lastPaymentHandle ?? undefined}
      lastPaymentPlain={lastPaymentPlain}
      lastPaymentFormatted={lastPaymentFormatted}
      lastRunId={payroll.lastRunId}
      onDecryptLastPayment={onDecryptLastPayment}
      balanceHandle={balanceHandle ?? undefined}
      balancePlain={balancePlain}
      balanceFormatted={balanceFormatted}
      onDecryptBalance={onDecryptBalance}
      onRequestUnwrap={onRequestUnwrap}
      isUnwrapping={isUnwrapping}
      status={status}
    />
  );
}
