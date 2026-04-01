"use client";

import dynamic from "next/dynamic";

import { WorkspaceRoutePending } from "@/components/WorkspaceRoutePending";
import { EmployerRouteBoundary } from "../EmployerRouteBoundary";

const EmployerEditPageClient = dynamic(
  () => import("./EmployerEditPageClient").then((mod) => mod.EmployerEditPageClient),
  {
    ssr: false,
    loading: () => (
      <WorkspaceRoutePending
        title="Loading employee editor"
        detail="Payrail is preparing employer tools for updating encrypted salary records and employee metadata."
      />
    ),
  }
);

export function LazyEmployerEditPageClient() {
  return (
    <EmployerRouteBoundary scope="full">
      <EmployerEditPageClient />
    </EmployerRouteBoundary>
  );
}
