"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/lib/useDictionary";

import { EditEmployeePanel } from "./EditEmployeePanel";
import { useEmployerEmployeeRecord } from "./useEmployerEmployeeRecord";

export function EmployerEmployeeRecordView() {
  const employeeRecord = useEmployerEmployeeRecord();
  const dict = useDictionary(employeeRecord.locale);

  if (!dict) return null;

  const dashboardDict = dict.employerDashboard as any;

  if (!employeeRecord.selectedRow) {
    return (
      <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
        <CardHeader className="pb-3">
          <div className="section-label">Employee record</div>
          <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
            {dashboardDict.editEmployeeTitle ?? "Edit employee"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-foreground">
            {dashboardDict.editEmployeeEmptyState ??
              "Select an employee from the roster to edit off-chain fields and update salary."}
          </p>
          <p className="text-xs text-muted-foreground">
            {dashboardDict.editEmployeeEmptyStateHint ??
              "Tip: clicking a row in the roster will select it."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <EditEmployeePanel
      row={employeeRecord.selectedRow}
      identity={employeeRecord.identity}
      identityLoading={employeeRecord.identityLoading}
      onSaveOffchain={(updates) =>
        employeeRecord.onUpdateEmployeeOffchain(employeeRecord.selectedRow!, updates)
      }
      onSavePii={employeeRecord.onSavePii}
      underlyingSymbol={employeeRecord.underlyingSymbol}
      updateSalaryInput={employeeRecord.updateSalaryInput}
      setUpdateSalaryInput={employeeRecord.setUpdateSalaryInput}
      onUpdateSalary={employeeRecord.onUpdateSalary}
      computedPayrollPeriod={employeeRecord.computedEmployeePayrollPeriod}
      computedRunId={employeeRecord.computedEmployeeRunId}
      onRunPayrollSingle={employeeRecord.onRunPayrollSingle}
      t={dict.editEmployeePanel}
    />
  );
}
