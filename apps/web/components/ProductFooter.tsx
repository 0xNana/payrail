"use client";

import Link from "next/link";
import { Lock, Zap } from "lucide-react";

import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

type ProductFooterProps = {
  locale: Locale;
  className?: string;
};

export function ProductFooter({ locale, className = "" }: ProductFooterProps) {
  const dict = useDictionary(locale);
  if (!dict) return null;
  const t = dict.employerDashboard;

  return (
    <footer className={`border-t border-border/70 ${className}`.trim()}>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="section-label">Payrail</div>
              <div className="text-lg font-semibold tracking-tight">Encrypted payroll infrastructure</div>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Compliant, auditable, encrypted payroll operations for institutions managing confidential compensation workflows on-chain.
          </p>
        </div>

        <div>
          <div className="section-label">Product</div>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href={`/${locale}`} className="text-muted-foreground transition-colors hover:text-foreground">
              Platform overview
            </Link>
            <Link href={`/${locale}/employer/dashboard`} className="text-muted-foreground transition-colors hover:text-foreground">
              Employer workspace
            </Link>
            <Link href={`/${locale}/employee`} className="text-muted-foreground transition-colors hover:text-foreground">
              Employee workspace
            </Link>
          </div>
        </div>

        <div>
          <div className="section-label">Network</div>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <span className="metric-chip w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.networkStatus}
            </span>
            <span className="metric-chip w-fit">
              <Zap className="h-3.5 w-3.5" />
              {t.latency}
            </span>
            <div>{t.copyright}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
