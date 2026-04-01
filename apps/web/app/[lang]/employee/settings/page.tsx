import type { Locale } from "@/i18n-config";
import { EmployeeSettingsPageClient } from "./EmployeeSettingsPageClient";

export default async function EmployeeSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <EmployeeSettingsPageClient lang={lang as Locale} />;
}
