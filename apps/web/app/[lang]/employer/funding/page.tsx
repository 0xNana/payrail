"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";
import { useDictionary } from "@/lib/useDictionary";

export default function EmployerFundingPage() {
  const ctx = useEmployerContext();
  const dict = useDictionary(ctx.locale);
  if (!dict) return null;
  const t = dict.employerDashboard as any;

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/funding`}>
      <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
        <CardHeader>
          <div className="section-label">Treasury funding</div>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">
            {t.fundingSection.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <span className="text-muted-foreground">{t.fundingSection.underlyingLabel}</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{String(ctx.underlyingAddr ?? "(loading)")}</code>
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <span className="text-muted-foreground">{t.fundingSection.symbolLabel}</span>
              <span className="text-xs">{ctx.underlyingSymbol}</span>
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <span className="text-muted-foreground">{t.fundingSection.decimalsLabel}</span>
              <span className="text-xs">{String(ctx.underlyingDecimalsValue ?? "(loading)")}</span>
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <span className="text-muted-foreground">{t.fundingSection.balanceLabel}</span>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {ctx.underlyingBalanceFormatted} {ctx.underlyingSymbol}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="section-label">
              {t.fundingSection.amountToWrapLabel} ({ctx.underlyingSymbol})
            </label>
            <Input
              value={ctx.wrapAmountInput}
              onChange={(e) => ctx.setWrapAmountInput(e.target.value)}
              placeholder={`Enter ${ctx.underlyingSymbol} amount`}
              type="number"
              className="bg-background"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={ctx.onApproveWrap} variant="outline">
              {t.fundingSection.approveButton}
            </Button>
            <Button onClick={ctx.onWrap}>
              {t.fundingSection.wrapButton}
            </Button>
          </div>

          <div className="border-t border-white/20 mt-4 dark:border-white/10" />

          <p className="rounded-[24px] border border-sky-500/15 bg-sky-500/10 p-4 text-sm text-muted-foreground">{t.fundingSection.flowNote}</p>
        </CardContent>
      </Card>
    </EmployerPageShell>
  );
}
