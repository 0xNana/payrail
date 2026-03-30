import type { Locale } from "@/i18n-config";
import type { ReactNode } from "react";
import { EmployerContextProvider } from "./EmployerContext";
import { Providers } from "../providers";

export default async function EmployerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <Providers>
      <EmployerContextProvider locale={lang as Locale}>{children}</EmployerContextProvider>
    </Providers>
  );
}
