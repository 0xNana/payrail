import type { Locale } from "@/i18n-config";
import type { ReactNode } from "react";

export default async function EmployerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  await params;
  return children;
}
