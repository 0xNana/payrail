"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditEmployeePanel } from "@/components/employer/EditEmployeePanel";
import { EmployerPageShell } from "@/components/employer/EmployerPageShell";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";
import { useDictionary } from "@/lib/useDictionary";
import {
  getEmployeeIdentity,
  updateEmployeePii,
  updateEmployeeOffchain,
  type EmployeeIdentity,
  type UpdateEmployeePiiParams,
} from "@/lib/supabasePayroll";
import { useAccount } from "wagmi";

export default function EmployerEditPage() {
  const ctx = useEmployerContext();
  const dict = useDictionary(ctx.locale);
  const { address: me } = useAccount();

  const [identity, setIdentity] = useState<EmployeeIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  const selectedRow = ctx.selectedRow;

  useEffect(() => {
    if (!selectedRow || !me) {
      setIdentity(null);
      return;
    }
    setIdentityLoading(true);
    getEmployeeIdentity(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id },
      me
    )
      .then(setIdentity)
      .catch(() => setIdentity(null))
      .finally(() => setIdentityLoading(false));
  }, [selectedRow?.employment_chain_binding_id, me]);

  async function handleSavePii(
    updates: Omit<UpdateEmployeePiiParams, "employment_chain_binding_id">
  ) {
    if (!selectedRow || !me) throw new Error("No employee selected");
    await updateEmployeePii(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id, ...updates },
      me
    );
    // Refresh PII after save
    const fresh = await getEmployeeIdentity(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id },
      me
    );
    setIdentity(fresh);
  }

  if (!dict) return null;

  const dashboardDict = dict.employerDashboard as any;

  return (
    <EmployerPageShell currentPath={`/${ctx.locale}/employer/edit`}>
      {selectedRow ? (
        <EditEmployeePanel
          row={selectedRow}
          identity={identity}
          identityLoading={identityLoading}
          onSaveOffchain={(updates) => ctx.onUpdateEmployeeOffchain(selectedRow, updates)}
          onSavePii={handleSavePii}
          underlyingSymbol={ctx.underlyingSymbol}
          updateSalaryInput={ctx.updateSalaryInput}
          setUpdateSalaryInput={ctx.setUpdateSalaryInput}
          onUpdateSalary={ctx.onUpdateSalary}
          computedPayrollPeriod={ctx.computedEmployeePayrollPeriod}
          computedRunId={ctx.computedEmployeeRunId}
          onRunPayrollSingle={ctx.onRunPayrollSingle}
          t={dict.editEmployeePanel}
        />
      ) : (
        <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
          <CardHeader className="pb-3">
            <div className="section-label">Employee record</div>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
              {dashboardDict.editEmployeeTitle ?? "Edit employee"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              {dashboardDict.editEmployeeEmptyState ?? "Select an employee from the roster to edit off-chain fields and update salary."}
            </p>
            <p className="text-xs text-muted-foreground">
              {dashboardDict.editEmployeeEmptyStateHint ?? "Tip: clicking a row in the roster will select it."}
            </p>
          </CardContent>
        </Card>
      )}
    </EmployerPageShell>
  );
}
