"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/i18n-config";
import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";

const EmployeeSettingsPageClient = dynamic(
  () => import("./EmployeeSettingsPageClient").then((mod) => mod.EmployeeSettingsPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading settings workspace"
        detail="Payrail is preparing employee preferences, theme controls, and workspace links."
      />
    ),
  }
);

export function LazyEmployeeSettingsPageClient({ lang }: { lang: Locale }) {
  return <EmployeeSettingsPageClient lang={lang} />;
}
