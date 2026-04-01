import type { Locale } from "@/i18n-config";
import { EmployeeHelpPageClient } from "./EmployeeHelpPageClient";

export default async function EmployeeHelpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <EmployeeHelpPageClient lang={lang as Locale} />;
}
