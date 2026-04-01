import Link from "next/link";
import { Lock } from "lucide-react";

import { ProductFooter } from "@/components/ProductFooter";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n-config";

import { HomePageHeaderActions } from "./HomePageHeaderActions";
import { HomePageOnboardingClient } from "./HomePageOnboardingClient";

interface HomePageContentProps {
  locale: Locale;
  dict: any;
}

export function HomePageContent({ locale, dict }: HomePageContentProps) {
  return (
    <div className="finance-shell min-h-screen text-foreground">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(248,250,252,0.78)] backdrop-blur-2xl dark:bg-[rgba(2,8,23,0.76)]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="section-label">Encrypted payroll infrastructure</div>
              <span className="mt-1 block text-xl font-semibold tracking-tight">PAYRAIL</span>
            </div>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <Link href={`/${locale}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {dict.nav.platformAdmin}
            </Link>
            <Link href={`/${locale}/employer/dashboard`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {dict.nav.employer}
            </Link>
            <Link href={`/${locale}/employee/salary`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {dict.nav.employee}
            </Link>
          </div>

          <HomePageHeaderActions />
        </div>
      </nav>

      <section className="px-6 pb-14 pt-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-5xl py-6">
            <div className="max-w-4xl">
              <div className="section-label">Private payroll infrastructure</div>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-foreground md:text-7xl">
                Encrypted payroll operations for regulated institutions.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-[1.25rem]">
                Salaries stay encrypted on-chain, employees decrypt only their own pay, employers execute payroll without exposing amounts, and auditors verify totals without seeing individual compensation.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/${locale}/employer/dashboard`}>
                <Button size="lg">{dict.common.goToEmployerDashboard}</Button>
              </Link>
              <Link href={`/${locale}/employee/salary`}>
                <Button variant="outline" size="lg">{dict.common.employeePortal}</Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-8 border-t border-border/70 pt-6 text-sm text-muted-foreground md:grid-cols-3">
              <div>
                <div className="section-label">Confidential execution</div>
                <p className="mt-2 leading-6">
                  Treasury movement, salary state, and payroll execution remain encrypted through the operating flow.
                </p>
              </div>
              <div>
                <div className="section-label">Auditable totals</div>
                <p className="mt-2 leading-6">
                  Review payroll outcomes and prove aggregate amounts without disclosing employee-level values.
                </p>
              </div>
              <div>
                <div className="section-label">Employee visibility</div>
                <p className="mt-2 leading-6">
                  Only the employee can decrypt their own compensation and confidential balance details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomePageOnboardingClient locale={locale} dict={dict} />

      <ProductFooter locale={locale} />
    </div>
  );
}
