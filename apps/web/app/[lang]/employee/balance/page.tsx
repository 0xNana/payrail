import type { Locale } from "@/i18n-config";
import { LazyEmployeeBalancePageClient } from "./LazyEmployeeBalancePageClient";

export default async function EmployeeBalancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LazyEmployeeBalancePageClient lang={lang as Locale} />;
}
