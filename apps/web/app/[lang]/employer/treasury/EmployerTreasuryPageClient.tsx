"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";
import { useDictionary } from "@/lib/useDictionary";

export function EmployerTreasuryPageClient() {
  const ctx = useEmployerContext();
  const dict = useDictionary(ctx.locale);
  if (!dict) return null;
  const t = dict.employerDashboard as any;

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/treasury`}>
      <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
        <CardHeader className="pb-3">
          <div className="section-label">Treasury visibility</div>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">{t.confidentialTreasury}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[28px] border border-white/30 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="section-label mb-2">{t.encryptedBalance}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-3 w-3 rounded-full bg-sky-500/25 animate-pulse" />
                ))}
              </div>
              <Button onClick={ctx.onDecryptBalance} variant="outline" className="px-4">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                {t.decrypt}
              </Button>
            </div>

            {ctx.employerConfidentialBalanceFormatted !== null && (
              <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                {ctx.employerConfidentialBalanceFormatted} {ctx.underlyingSymbol}
              </p>
            )}
          </div>
          <div className="border-t border-white/20 mt-4 dark:border-white/10" />
          <p className="rounded-[24px] border border-sky-500/15 bg-sky-500/10 p-4 text-sm leading-relaxed text-muted-foreground">{t.decryptionNote}</p>
        </CardContent>
      </Card>
    </EmployerPageShell>
  );
}
