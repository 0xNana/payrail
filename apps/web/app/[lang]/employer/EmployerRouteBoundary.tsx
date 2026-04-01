"use client";

import { useParams } from "next/navigation";

import type { Locale } from "@/i18n-config";

import { EmployerContextProvider } from "./EmployerContext";

export function EmployerRouteBoundary({
  children,
  scope = "full",
}: {
  children: React.ReactNode;
  scope?: "core" | "full";
}) {
  const params = useParams<{ lang: string }>();
  const locale = (params?.lang ?? "en") as Locale;

  return (
    <EmployerContextProvider locale={locale} scope={scope}>
      {children}
    </EmployerContextProvider>
  );
}
