import type { Locale } from "@/i18n-config";
import { LazyEmployeeSalaryPageClient } from "./LazyEmployeeSalaryPageClient";

export default async function EmployeeSalaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LazyEmployeeSalaryPageClient lang={lang as Locale} />;
}
