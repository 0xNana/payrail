import type { Locale } from "@/i18n-config";
import { EmployeeBalancePageClient } from "./EmployeeBalancePageClient";

export default async function EmployeeBalancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <EmployeeBalancePageClient lang={lang as Locale} />;
}
