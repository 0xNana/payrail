"use client";

import { useState } from "react";

import { EmployeeHelp } from "@/components/employee/EmployeeHelp";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";

export function EmployeeHelpPageClient({ lang }: { lang: Locale }) {
  const t = useDictionary(lang);
  const [status] = useState("");

  if (!t) return null;

  return <EmployeeHelp locale={lang} status={status} />;
}
