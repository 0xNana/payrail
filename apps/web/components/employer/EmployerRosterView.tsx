"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "viem";

import { useDictionary } from "@/lib/useDictionary";
import type { EmployerRosterRow } from "@/lib/supabasePayroll";

import { EmployeeRoster } from "./EmployeeRoster";
import { SingleEmployeePayrollModal } from "./SingleEmployeePayrollModal";
import { useEmployerRoster } from "./useEmployerRoster";

export function EmployerRosterView() {
  const roster = useEmployerRoster();
  const dict = useDictionary(roster.locale);
  const router = useRouter();
  const [payrollModalEmployee, setPayrollModalEmployee] = useState<EmployerRosterRow | null>(null);

  if (!dict) return null;

  function handleSelect(addr: Address) {
    roster.onSelectEmployee(addr);
    router.push(`/${roster.locale}/employer/edit`);
  }

  function handleRunPayroll(row: EmployerRosterRow) {
    roster.onSelectEmployee(row.wallet_address);
    setPayrollModalEmployee(row);
  }

  return (
    <>
      <EmployeeRoster
        rows={roster.rosterRows}
        loading={roster.rosterLoading}
        onSelect={handleSelect}
        onRemove={roster.onRemoveEmployee}
        t={dict.employeeRoster}
        selectedEmployee={roster.selectedEmployee}
        onSelectEmployee={(addr) => roster.onSelectEmployee(addr as Address | "")}
        onDecryptSalary={roster.onDecryptSalary}
        onDecryptLastPayment={roster.onDecryptLastPayment}
        selectedSalaryPlain={roster.selectedSalaryPlain}
        selectedSalaryFormatted={roster.selectedSalaryFormatted}
        selectedLastPaymentPlain={roster.selectedLastPaymentPlain}
        selectedLastPaymentFormatted={roster.selectedLastPaymentFormatted}
        underlyingSymbol={roster.underlyingSymbol}
        tConfidential={{
          confidentialView: (dict.employerDashboard as any).confidentialView,
          salaryPlaintext: (dict.employerDashboard as any).salaryPlaintext,
          historyDecryption: (dict.employerDashboard as any).historyDecryption,
          decryptionWarning: (dict.employerDashboard as any).decryptionWarning,
        }}
        onRunPayroll={handleRunPayroll}
      />

      <SingleEmployeePayrollModal
        open={payrollModalEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setPayrollModalEmployee(null);
        }}
        employee={payrollModalEmployee}
        payrollAddr={roster.payrollAddr}
        operatorStatus={roster.operatorStatus}
        operatorDays={roster.operatorDays}
        computedRunId={roster.computedEmployeeRunId}
        computedPeriod={roster.computedEmployeePayrollPeriod}
        salaryHandle={roster.selectedSalaryHandle}
        onRunSingle={roster.onRunPayrollSingle}
        onGoToOperator={() => router.push(`/${roster.locale}/employer/operator`)}
      />
    </>
  );
}
