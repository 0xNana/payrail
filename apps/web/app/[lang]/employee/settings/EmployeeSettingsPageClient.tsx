"use client";

import { useState } from "react";

import { EmployeeSettings } from "@/components/employee/EmployeeSettings";
import { useDictionary } from "@/lib/useDictionary";
import type { Locale } from "@/i18n-config";

export function EmployeeSettingsPageClient({ lang }: { lang: Locale }) {
  const t = useDictionary(lang);
  const [status] = useState("");

  if (!t) return null;

  return (
    <EmployeeSettings
      locale={lang}
      status={status}
    />
  );
}
