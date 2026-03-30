"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/lib/useDictionary";

import { useEmployerFunding } from "./useEmployerFunding";

export function EmployerFundingView() {
  const funding = useEmployerFunding();
  const dict = useDictionary(funding.locale);

  if (!dict) return null;
  const t = dict.employerDashboard as any;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-label">Treasury funding</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.fundingSection.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Move settlement capital into the encrypted payroll treasury without exposing balances publicly.
          </p>
        </div>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em]">
          {funding.underlyingSymbol}
        </Badge>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_320px]">
        <section className="space-y-5 border border-border/70 bg-card/80 p-6">
          <div className="grid gap-0 border border-border/70 md:grid-cols-2">
            <div className="border-b border-border/70 p-4 md:border-b-0 md:border-r">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {t.fundingSection.underlyingLabel}
              </div>
              <code className="mt-2 block break-all text-sm text-foreground">
                {String(funding.underlyingAddr ?? "(loading)")}
              </code>
            </div>
            <div className="border-b border-border/70 p-4 md:border-b-0">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {t.fundingSection.balanceLabel}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {funding.underlyingBalanceFormatted} {funding.underlyingSymbol}
              </div>
            </div>
            <div className="border-b border-border/70 p-4 md:border-b-0 md:border-r">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {t.fundingSection.symbolLabel}
              </div>
              <div className="mt-2 text-sm text-foreground">{funding.underlyingSymbol}</div>
            </div>
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {t.fundingSection.decimalsLabel}
              </div>
              <div className="mt-2 text-sm text-foreground">{String(funding.underlyingDecimalsValue)}</div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {t.fundingSection.amountToWrapLabel} ({funding.underlyingSymbol})
            </label>
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input
                value={funding.wrapAmountInput}
                onChange={(e) => funding.setWrapAmountInput(e.target.value)}
                placeholder={`Enter ${funding.underlyingSymbol} amount`}
                type="number"
                className="h-11 bg-background"
              />
              <Button onClick={funding.onWrap} className="h-11 min-w-40">
                {t.fundingSection.wrapButton}
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-4 border border-border/70 bg-card/60 p-6">
          <div>
            <div className="section-label">Funding controls</div>
            <p className="mt-2 text-sm text-muted-foreground">{t.fundingSection.flowNote}</p>
          </div>
          <Button onClick={funding.onApproveWrap} variant="outline" className="w-full">
            {t.fundingSection.approveButton}
          </Button>
        </aside>
      </div>
    </section>
  );
}
