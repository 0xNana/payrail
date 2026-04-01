"use client";

import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { EmployerFundingView } from "@/components/employer/EmployerFundingView";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

export function EmployerFundingPageClient() {
  const ctx = useEmployerContext();

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/funding`}>
      <EmployerFundingView />
    </EmployerPageShell>
  );
}
