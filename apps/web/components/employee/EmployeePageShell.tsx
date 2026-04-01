"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductFooter } from "@/components/ProductFooter";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

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

type Props = {
  locale: Locale;
  currentPath: string;
  title: string;
  subtitle: string;
  status?: string;
  children: React.ReactNode;
};

export function EmployeePageShell({ locale, currentPath, title, subtitle, status, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dict = useDictionary(locale);

  if (!dict) return null;

  const employeeSidebar = dict.employeeSidebar as any;

  return (
    <div className="finance-shell min-h-screen text-foreground">
      <Sidebar
        locale={locale}
        variant="employee"
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
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <div>
                  <h1 className="text-[2rem] font-semibold tracking-tight text-foreground">{title}</h1>
                  {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href={`/${locale}`}>
                  <Button variant="outline">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {employeeSidebar.backToHome}
                  </Button>
                </Link>
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
        {status && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status.startsWith("✅")
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                : status.startsWith("❌")
                  ? "border-red-500/20 bg-red-500/10 text-red-950 dark:text-red-100"
                  : "border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-100"
            }`}
          >
            {status}
          </div>
        )}

        {children}
      </main>

      <ProductFooter locale={locale} className="mt-12" />
    </div>
  );
}
