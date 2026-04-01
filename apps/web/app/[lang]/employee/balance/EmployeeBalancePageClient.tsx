"use client";

import { useEffect, useState } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useWalletClient } from "wagmi";

import { EmployeeBalance } from "@/components/employee/EmployeeBalance";
import { tryGetContracts } from "@/lib/contracts";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
import { getEmployeePayrollBindings, type EmployeePayrollBinding } from "@/lib/supabasePayroll";
import { targetPayrollChain } from "@/lib/targetChain";

export function EmployeeBalancePageClient({ lang }: { lang: Locale }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const t = useDictionary(lang);

  const [selectedPayroll, setSelectedPayroll] = useState<Address | "">("");
  const [bindings, setBindings] = useState<EmployeePayrollBinding[]>([]);
  const [bindingsLoading, setBindingsLoading] = useState(false);
  const [bindingsError, setBindingsError] = useState<string | null>(null);
  const [lastPaymentPlain, setLastPaymentPlain] = useState<bigint | null>(null);
  const [lastPaymentFormatted, setLastPaymentFormatted] = useState<string | null>(null);
  const [balancePlain, setBalancePlain] = useState<bigint | null>(null);
  const [balanceFormatted, setBalanceFormatted] = useState<string | null>(null);
  const [balanceHandle, setBalanceHandle] = useState<string | null>(null);
  const [lastPaymentHandle, setLastPaymentHandle] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const publicClient = usePublicClient({ chainId: targetPayrollChain.id });

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
    abi: [
      { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "string" }] },
    ] as const,
    functionName: "symbol",
    chainId: targetPayrollChain.id,
  });

  const { data: tokenDecimals } = useReadContract({
    address: contracts?.PayrailToken.address,
    abi: [
      { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
    ] as const,
    functionName: "decimals",
    chainId: targetPayrollChain.id,
  });

  const { data: lastRunIdData } = useReadContract({
    address: payrollAddr,
    abi: contracts?.PayrailAbi,
    functionName: "myLastRunId",
    account: me,
    chainId: targetPayrollChain.id,
    query: { enabled: !!contracts && !!payrollAddr && !!me },
  });

  const onDecryptBalance = async () => {
    if (!walletClient || !me || !publicClient || !contracts) return;
    try {
      const { decryptUint128 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting balance...");
      const handle = await publicClient.readContract({
        address: contracts.PayrailToken.address,
        abi: contracts.PayrailToken.abi,
        functionName: "balanceOfEncrypted",
        args: [me],
        account: me,
      });
      setBalanceHandle(String(handle));
      const result = await decryptUint128({
        chainId: targetPayrollChain.id,
        publicClient,
        walletClient,
        account: me,
        handle: handle as `0x${string}`,
      });
      setBalancePlain(result);
      setBalanceFormatted(formatUnits(result, tokenDecimals ?? 18));
      setStatus("✅ Balance decrypted successfully!");
    } catch (err) {
      setStatus(`❌ Failed to decrypt balance: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const onDecryptLastPayment = async () => {
    if (!publicClient || !walletClient || !me || !selectedPayroll || !contracts) return;
    try {
      const { decryptUint64 } = await import("@/lib/fhe");
      setStatus("🔐 Decrypting last payment...");
      const handle = await publicClient.readContract({
        address: selectedPayroll,
        abi: contracts.PayrailAbi,
        functionName: "myLastPayment",
        args: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        account: me,
      });
      setLastPaymentHandle(String(handle));
      const result = await decryptUint64({
        chainId: targetPayrollChain.id,
        publicClient,
        walletClient,
        account: me,
        handle: handle as `0x${string}`,
      });
      setLastPaymentPlain(result);
      setLastPaymentFormatted(formatUnits(result, tokenDecimals ?? 18));
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
    setSelectedPayroll(addr);
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
      chainId={chainId}
      canUseFhe={chainId === targetPayrollChain.id && !!contracts}
      tokenSymbol={tokenSymbol ?? "Encrypted Payroll Token"}
      tokenDecimals={tokenDecimals ?? 18}
      underlyingAddr={contracts?.PayrailToken.address}
      userAddress={me}
      bindings={bindings}
      bindingsLoading={bindingsLoading}
      bindingsError={bindingsError}
      selectedPayroll={selectedPayroll}
      onSelectPayroll={onSelectPayroll}
      lastPaymentHandle={lastPaymentHandle ?? undefined}
      lastPaymentPlain={lastPaymentPlain}
      lastPaymentFormatted={lastPaymentFormatted}
      lastRunId={lastRunIdData !== undefined && lastRunIdData !== null ? String(lastRunIdData) : undefined}
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
