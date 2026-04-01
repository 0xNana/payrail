"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerSettingsPageClient = dynamic(
  () => import("./EmployerSettingsPageClient").then((mod) => mod.EmployerSettingsPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading employer settings"
        detail="Payrail is preparing company details, network state, and payroll contract configuration."
      />
    ),
  }
);

export function LazyEmployerSettingsPageClient() {
  return (
    <EmployerRouteBoundary scope="core">
      <EmployerSettingsPageClient />
    </EmployerRouteBoundary>
  );
}
