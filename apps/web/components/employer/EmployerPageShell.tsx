"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Children, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PayrollConfirmModal } from "@/components/employer/PayrollConfirmModal";
import { ProductFooter } from "@/components/ProductFooter";
import { useDictionary } from "@/lib/useDictionary";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

const Sidebar = dynamic(() => import("@/components/Sidebar").then((m) => m.Sidebar), {
  ssr: false,
});

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then((m) => m.ThemeToggle), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-full border border-white/20" />,
});

const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher").then((m) => m.LanguageSwitcher), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-full border border-white/20" />,
});

interface EmployerPageShellProps {
  currentPath: string;
  children: React.ReactNode;
}

export function EmployerPageShell({ currentPath, children }: EmployerPageShellProps) {
  const router = useRouter();
  const ctx = useEmployerContext();
  const dict = useDictionary(ctx.locale);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  if (!dict) return null;
  const t = dict.employerDashboard as any;
  const content = Children.toArray(children);

  return (
    <div className="finance-shell min-h-screen text-foreground">
      <PayrollConfirmModal
        open={showPayrollModal}
        onOpenChange={setShowPayrollModal}
        payrollAddr={ctx.payrollAddr}
        operatorStatus={ctx.operatorStatus}
        operatorDays={ctx.operatorDays}
        activeEmployeeCount={ctx.activeEmployeeCount}
        activeCadenceCount={ctx.activeCadenceCount}
        selectedEmployee={ctx.selectedEmployee}
        onRunBatch={ctx.onRunPayrollBatch}
        onRunSingle={ctx.onRunPayrollSingle}
        onScrollToOperator={() => {
          setShowPayrollModal(false);
          router.push(`/${ctx.locale}/employer/operator`);
        }}
      />

      <Sidebar
        locale={ctx.locale}
        variant="employer"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
      />

      <header className="sticky top-0 z-30 border-b border-border/70 bg-[rgba(248,250,252,0.86)] backdrop-blur-xl dark:bg-[rgba(11,17,24,0.92)]">
        <div className="mx-auto max-w-[1440px] px-6 py-4">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="mt-0.5 border border-border/70 bg-background text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <div>
                  <div className="section-label">{ctx.companyName || "Employer operations"}</div>
                  <h1 className="mt-1 text-[2rem] font-semibold tracking-tight text-foreground">{t.title}</h1>
                  <p className="mt-2 flex max-w-2xl items-center gap-1.5 text-sm text-muted-foreground">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t.securedByFhe}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href={`/${ctx.locale}`}>
                  <Button variant="outline" className="border-border text-foreground">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t.backToHome ?? "Back to Home"}
                  </Button>
                </Link>
                <ThemeToggle />
                <LanguageSwitcher />
                <Button
                  variant="outline"
                  onClick={ctx.onExportCsv}
                  className="border-border text-foreground"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t.exportCsv}
                </Button>
                <Button
                  onClick={() => setShowPayrollModal(true)}
                  disabled={ctx.activeEmployeeCount === 0}
                  className="px-5"
                  title={
                    ctx.activeEmployeeCount === 0
                      ? t.runDisabledNoEmployees ?? "No active employees to pay."
                      : undefined
                  }
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.runPayroll ?? "Review payroll run"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-border/70 pt-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-4 dark:bg-[rgba(16,22,30,0.9)]">
              <div className="section-label">Company</div>
              <div className="mt-2 text-xl font-semibold tracking-tight">{ctx.companyName || "Not configured"}</div>
              <p className="mt-1 text-xs text-muted-foreground">Primary operating entity</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-4 dark:bg-[rgba(16,22,30,0.9)]">
              <div className="section-label">Active employees</div>
              <div className="mt-2 text-xl font-semibold tracking-tight">{ctx.activeEmployeeCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Eligible for the next payroll cycle</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-4 dark:bg-[rgba(16,22,30,0.9)]">
              <div className="section-label">Cadences</div>
              <div className="mt-2 text-xl font-semibold tracking-tight">{ctx.activeCadenceCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Configured payment schedules</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card px-4 py-4 dark:bg-[rgba(16,22,30,0.9)]">
              <div className="section-label">Status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${ctx.hasCompany ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200"}`}>
                  {ctx.hasCompany ? "Provisioned" : "Pending"}
                </span>
                <span className="text-sm font-medium text-foreground">CoFHE active</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Arbitrum Sepolia control plane</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
        {ctx.status && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              ctx.status.startsWith("✅")
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                : ctx.status.startsWith("ℹ️") || ctx.status.startsWith("⏳")
                  ? "border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-100"
                  : "border-red-500/20 bg-red-500/10 text-red-950 dark:text-red-100"
            }`}
          >
            {ctx.status}
          </div>
        )}

        {!ctx.hasCompany && (
          <Card className="border-red-500/20 bg-red-500/10">
            <CardContent className="pt-4">
              <p className="text-red-950 dark:text-red-100">{t.noCompanyWarning}</p>
            </CardContent>
          </Card>
        )}

        {ctx.hasCompany && !ctx.backendSynced && (
          <Card className="border-amber-500/20 bg-amber-500/10">
            <CardContent className="pt-4">
              <p className="text-amber-950 dark:text-amber-100">{t.supabaseNotSynced}</p>
            </CardContent>
          </Card>
        )}

        {ctx.supabaseError && (
          <Card className="border-red-500/20 bg-red-500/10">
            <CardContent className="pt-4">
              <p className="text-red-950 dark:text-red-100">
                {t.supabaseError}: {ctx.supabaseError}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {content.map((child, index) => (
            <div
              key={index}
              className={index > 0 ? "border-t border-border/70 pt-6" : ""}
            >
              {child}
            </div>
          ))}
        </div>
      </main>

      <ProductFooter locale={ctx.locale} className="mt-12" />
    </div>
  );
}
