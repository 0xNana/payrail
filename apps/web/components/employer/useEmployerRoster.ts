"use client";

import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

export function useEmployerRoster() {
  const ctx = useEmployerContext();

  return {
    locale: ctx.locale,
    payrollAddr: ctx.payrollAddr,
    operatorStatus: ctx.operatorStatus,
    operatorDays: ctx.operatorDays,
    rosterRows: ctx.rosterRows,
    rosterLoading: ctx.rosterLoading,
    selectedEmployee: ctx.selectedEmployee,
    selectedSalaryHandle: ctx.selectedSalaryHandle,
    selectedSalaryPlain: ctx.selectedSalaryPlain,
    selectedSalaryFormatted: ctx.selectedSalaryFormatted,
    selectedLastPaymentPlain: ctx.selectedLastPaymentPlain,
    selectedLastPaymentFormatted: ctx.selectedLastPaymentFormatted,
    computedEmployeeRunId: ctx.computedEmployeeRunId,
    computedEmployeePayrollPeriod: ctx.computedEmployeePayrollPeriod,
    underlyingSymbol: ctx.underlyingSymbol,
    onSelectEmployee: ctx.onSelectEmployee,
    onRemoveEmployee: ctx.onRemoveEmployee,
    onDecryptSalary: ctx.onDecryptSalary,
    onDecryptLastPayment: ctx.onDecryptLastPayment,
    onRunPayrollSingle: ctx.onRunPayrollSingle,
  };
}
