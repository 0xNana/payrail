"use client";

import { useState } from "react";
import { useChainId } from "wagmi";

import { EmployeeSettings } from "@/components/employee/EmployeeSettings";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";
import { targetPayrollChain } from "@/lib/targetChain";

export function EmployeeSettingsPageClient({ lang }: { lang: Locale }) {
  const chainId = useChainId();
  const t = useDictionary(lang);
  const [status] = useState("");

  if (!t) return null;

  return (
    <EmployeeSettings
      locale={lang}
      chainId={chainId}
      canUseFhe={chainId === targetPayrollChain.id}
      tokenSymbol="USDC"
      tokenDecimals={18}
      underlyingAddr={undefined}
      status={status}
    />
  );
}
