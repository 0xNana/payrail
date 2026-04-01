"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/i18n-config";
import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployeePayrollProvider } from "../EmployeePayrollContext";

const EmployeeBalancePageClient = dynamic(
  () => import("./EmployeeBalancePageClient").then((mod) => mod.EmployeeBalancePageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading balance workspace"
        detail="Payrail is preparing the confidential balance view and the employee payment history panel."
      />
    ),
  }
);

export function LazyEmployeeBalancePageClient({ lang }: { lang: Locale }) {
  return (
    <EmployeePayrollProvider lang={lang}>
      <EmployeeBalancePageClient lang={lang} />
    </EmployeePayrollProvider>
  );
}
