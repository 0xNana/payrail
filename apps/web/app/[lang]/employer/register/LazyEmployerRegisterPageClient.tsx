"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerRegisterPageClient = dynamic(
  () => import("./EmployerRegisterPageClient").then((mod) => mod.EmployerRegisterPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading employee registration"
        detail="Payrail is preparing employer onboarding controls for adding employees to the payroll roster."
      />
    ),
  }
);

export function LazyEmployerRegisterPageClient() {
  return (
    <EmployerRouteBoundary scope="core">
      <EmployerRegisterPageClient />
    </EmployerRouteBoundary>
  );
}
