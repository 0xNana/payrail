import { redirect } from "next/navigation";
import type { Locale } from "@/i18n-config";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${(lang as Locale) || "en"}/employee/salary`);
}
