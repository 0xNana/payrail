"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerFundingPageClient = dynamic(
  () => import("./EmployerFundingPageClient").then((mod) => mod.EmployerFundingPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading funding workspace"
        detail="Payrail is preparing employer funding controls and encrypted payroll liquidity management."
      />
    ),
  }
);

export function LazyEmployerFundingPageClient() {
  return (
    <EmployerRouteBoundary scope="core">
      <EmployerFundingPageClient />
    </EmployerRouteBoundary>
  );
}
