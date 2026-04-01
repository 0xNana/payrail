"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EmployeePageShell } from "@/components/employee/EmployeePageShell";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

interface EmployeeSettingsProps {
  locale: Locale;
  status: string;
}

export function EmployeeSettings({
  locale,
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
      subtitle=""
      status={status}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Link href={`/${locale}/employee/salary`}>
            <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
              <CardContent className="p-5">
                <div className="section-label">Compensation</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">Salary</h3>
                <p className="mt-2 text-sm text-muted-foreground">Open your salary view.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/${locale}/employee/balance`}>
            <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
              <CardContent className="p-5">
                <div className="section-label">Compensation</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">Balance</h3>
                <p className="mt-2 text-sm text-muted-foreground">Open your balance view.</p>
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
    </EmployeePageShell>
  );
}
