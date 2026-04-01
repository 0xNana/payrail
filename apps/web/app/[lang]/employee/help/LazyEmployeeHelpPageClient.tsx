"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/i18n-config";
import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";

const EmployeeHelpPageClient = dynamic(() => import("./EmployeeHelpPageClient").then((mod) => mod.EmployeeHelpPageClient), {
  ssr: false,
  loading: () => (
    <WorkspaceRoutePending
      title="Loading help workspace"
      detail="Payrail is preparing employee guidance, support links, and troubleshooting references."
    />
  ),
});

export function LazyEmployeeHelpPageClient({ lang }: { lang: Locale }) {
  return <EmployeeHelpPageClient lang={lang} />;
}
