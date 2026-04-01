"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/i18n-config";
import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployeePayrollProvider } from "../EmployeePayrollContext";

const EmployeeSalaryPageClient = dynamic(() => import("./EmployeeSalaryPageClient").then((mod) => mod.EmployeeSalaryPageClient), {
  ssr: false,
  loading: () => (
    <WorkspaceRoutePending
      title="Loading salary workspace"
      detail="Payrail is preparing the employee salary session and wallet-connected payroll view."
    />
  ),
});

export function LazyEmployeeSalaryPageClient({ lang }: { lang: Locale }) {
  return (
    <EmployeePayrollProvider lang={lang}>
      <EmployeeSalaryPageClient lang={lang} />
    </EmployeePayrollProvider>
  );
}
