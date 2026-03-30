"use client";

import Link from "next/link";
import { type Address } from "viem";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmployeePageShell } from "@/components/employee/EmployeePageShell";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

interface EmployeeSettingsProps {
  locale: Locale;
  chainId?: number;
  canUseFhe: boolean;
  tokenSymbol: string;
  tokenDecimals: number;
  underlyingAddr?: Address;
  status: string;
}

export function EmployeeSettings({
  locale,
  chainId,
  canUseFhe,
  tokenSymbol,
  underlyingAddr,
  status,
}: EmployeeSettingsProps) {
  const dict = useDictionary(locale);

  if (!dict) return null;

  const t = dict.employeePage;
  const tSidebar = dict.employeeSidebar as any;

  return (
    <EmployeePageShell
      locale={locale}
      currentPath={`/${locale}/employee/settings`}
      title="Workspace settings"
      subtitle={t.securedByFhe}
      status={status}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
          <CardHeader>
            <div className="section-label">Network posture</div>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">Runtime configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="section-label">Chain ID</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{chainId || "Pending"}</div>
            </div>
            <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="section-label">FHE status</div>
              <div className="mt-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {canUseFhe ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="section-label">Token symbol</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{tokenSymbol || "Pending"}</div>
            </div>
            <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="section-label">Token address</div>
              <code className="mt-2 block break-all font-mono text-xs text-muted-foreground">{String(underlyingAddr || "Pending")}</code>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
            <CardHeader>
              <div className="section-label">Preferences</div>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">{tSidebar.preferencesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="font-medium text-foreground">{tSidebar.preferencesTitle}</p>
                  <p className="text-sm text-muted-foreground">{tSidebar.themeDesc}</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground">{tSidebar.languageDesc}</p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
            <CardHeader>
              <div className="section-label">Security</div>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">{tSidebar.securityTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="font-medium text-foreground">{tSidebar.encryptionActive}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tSidebar.encryptionNote}</p>
              </div>
              <div className="rounded-[24px] border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-medium text-foreground">{tSidebar.walletConnection}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tSidebar.connectionNote}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href={`/${locale}/employee/salary`}>
              <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Compensation</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Salary</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Return to encrypted salary visibility.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/${locale}/employee/help`}>
              <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Support</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{tSidebar.help}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{dict.common?.support}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </EmployeePageShell>
  );
}
