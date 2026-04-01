"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";
import { useDictionary } from "@/lib/useDictionary";

export function EmployerOperatorPageClient() {
  const ctx = useEmployerContext();
  const dict = useDictionary(ctx.locale);
  if (!dict) return null;
  const t = dict.employerDashboard as any;

  const operatorBadgeText =
    ctx.operatorStatus === undefined
      ? dict.common?.active ?? "Active"
      : ctx.operatorStatus
      ? dict.common?.active ?? "Active"
      : dict.common?.inactive ?? "Inactive";

  const operatorBadgeClass =
    ctx.operatorStatus === false
      ? "bg-destructive/15 text-destructive-foreground border-destructive/30"
      : "bg-success/20 text-success-foreground border-success/30";

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/operator`}>
      <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label">Operator approval</div>
              <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">{t.operatorControls}</CardTitle>
            </div>
            <Badge variant="default" className={`${operatorBadgeClass} rounded-full px-3 py-1 text-[10px]`}>
              {operatorBadgeText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t.isOperatorStatus}</p>
                <p className="text-xs text-muted-foreground">
                  {t.authorizedSession ??
                    "The payroll contract must be approved as an operator to move funds from your confidential balance."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-3 bg-muted-foreground/20 rounded-sm" />
                <div className={`w-6 h-3 rounded-sm ${ctx.operatorStatus === false ? "bg-destructive" : "bg-primary"}`} />
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 my-4 dark:border-white/10" />

          <div>
            <p className="section-label mb-2">{t.renewalPeriodDays}</p>
            <div className="flex gap-2">
              <Input
                value={ctx.operatorDays}
                onChange={(e) => ctx.setOperatorDays(e.target.value)}
                className="bg-muted border-border text-foreground h-9 text-sm flex-1"
              />
              <Button onClick={ctx.onSetOperator} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm">
                {t.update}
              </Button>
            </div>
          </div>

          <Button
            variant="destructive"
            disabled
            className="mt-4 w-full border border-destructive/20 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 disabled:opacity-60"
            title={t.revokeNotImplemented ?? "Not implemented"}
          >
            {t.revokeAllAccess}
          </Button>
        </CardContent>
      </Card>
    </EmployerPageShell>
  );
}
