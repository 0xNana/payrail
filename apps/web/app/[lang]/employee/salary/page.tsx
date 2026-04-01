import type { Locale } from "@/i18n-config";
import { EmployeeSalaryPageClient } from "./EmployeeSalaryPageClient";

export default async function EmployeeSalaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <EmployeeSalaryPageClient lang={lang as Locale} />;
}
