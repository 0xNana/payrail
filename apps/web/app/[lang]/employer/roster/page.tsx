"use client";

import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { EmployerRosterView } from "@/components/employer/EmployerRosterView";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

export default function EmployerRosterPage() {
  const ctx = useEmployerContext();

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/roster`}>
      <EmployerRosterView />
    </EmployerPageShell>
  );
}
