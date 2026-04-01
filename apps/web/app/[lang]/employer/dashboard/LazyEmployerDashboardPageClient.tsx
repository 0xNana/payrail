"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerDashboardPageClient = dynamic(
  () => import("./EmployerDashboardPageClient").then((mod) => mod.EmployerDashboardPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading employer dashboard"
        detail="Payrail is preparing the employer control plane, payroll overview, and confidential treasury controls."
      />
    ),
  }
);

export function LazyEmployerDashboardPageClient() {
  return (
    <EmployerRouteBoundary scope="full">
      <EmployerDashboardPageClient />
    </EmployerRouteBoundary>
  );
}
