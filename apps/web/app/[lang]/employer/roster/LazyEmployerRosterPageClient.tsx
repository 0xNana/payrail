"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerRosterPageClient = dynamic(
  () => import("./EmployerRosterPageClient").then((mod) => mod.EmployerRosterPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading roster workspace"
        detail="Payrail is preparing the employer roster, payroll cadence data, and confidential employee records."
      />
    ),
  }
);

export function LazyEmployerRosterPageClient() {
  return (
    <EmployerRouteBoundary scope="full">
      <EmployerRosterPageClient />
    </EmployerRouteBoundary>
  );
}
