"use client";

import { useState, use } from "react";
import { useAccount, useChainId } from "wagmi";

import { EmployeeSettings } from "@/components/employee/EmployeeSettings";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
import { targetPayrollChain } from "@/lib/targetChain";

export default function EmployeeSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const lang = use(params).lang as Locale;
  const t = useDictionary(lang);

  const [status, setStatus] = useState("");

  if (!t) return null;

  return (
    <EmployeeSettings
      locale={lang}
      // Network state
      chainId={chainId}
      canUseFhe={chainId === targetPayrollChain.id}
      tokenSymbol="USDC"
      tokenDecimals={18}
      underlyingAddr={undefined}

      // Status
      status={status}
    />
  );
}
