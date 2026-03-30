"use client";

import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

export function useEmployerFunding() {
  const ctx = useEmployerContext();

  return {
    locale: ctx.locale,
    underlyingAddr: ctx.underlyingAddr,
    underlyingSymbol: ctx.underlyingSymbol,
    underlyingDecimalsValue: ctx.underlyingDecimalsValue,
    underlyingBalanceFormatted: ctx.underlyingBalanceFormatted,
    wrapAmountInput: ctx.wrapAmountInput,
    setWrapAmountInput: ctx.setWrapAmountInput,
    onApproveWrap: ctx.onApproveWrap,
    onWrap: ctx.onWrap,
  };
}
