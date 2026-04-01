import type { Locale } from "@/i18n-config";
import { LazyEmployeeSettingsPageClient } from "./LazyEmployeeSettingsPageClient";

export default async function EmployeeSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LazyEmployeeSettingsPageClient lang={lang as Locale} />;
}
