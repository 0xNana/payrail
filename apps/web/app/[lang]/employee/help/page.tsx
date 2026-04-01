import type { Locale } from "@/i18n-config";
import { LazyEmployeeHelpPageClient } from "./LazyEmployeeHelpPageClient";

export default async function EmployeeHelpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LazyEmployeeHelpPageClient lang={lang as Locale} />;
}
