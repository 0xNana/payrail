"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerTreasuryPageClient = dynamic(
  () => import("./EmployerTreasuryPageClient").then((mod) => mod.EmployerTreasuryPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading treasury workspace"
        detail="Payrail is preparing employer treasury visibility and confidential balance operations."
      />
    ),
  }
);

export function LazyEmployerTreasuryPageClient() {
  return (
    <EmployerRouteBoundary scope="core">
      <EmployerTreasuryPageClient />
    </EmployerRouteBoundary>
  );
}
