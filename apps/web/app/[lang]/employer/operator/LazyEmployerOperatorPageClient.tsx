"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerOperatorPageClient = dynamic(
  () => import("./EmployerOperatorPageClient").then((mod) => mod.EmployerOperatorPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading operator controls"
        detail="Payrail is preparing employer operator permissions and payroll execution settings."
      />
    ),
  }
);

export function LazyEmployerOperatorPageClient() {
  return (
    <EmployerRouteBoundary scope="core">
      <EmployerOperatorPageClient />
    </EmployerRouteBoundary>
  );
}
