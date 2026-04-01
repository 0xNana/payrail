"use client";

import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { EmployerEmployeeRecordView } from "@/components/employer/EmployerEmployeeRecordView";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

export function EmployerEditPageClient() {
  const ctx = useEmployerContext();

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/edit`}>
      <EmployerEmployeeRecordView />
    </EmployerPageShell>
  );
}
