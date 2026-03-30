"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";
import {
  getEmployeeIdentity,
  updateEmployeePii,
  type EmployeeIdentity,
  type UpdateEmployeePiiParams,
} from "@/lib/supabasePayroll";

export function useEmployerEmployeeRecord() {
  const ctx = useEmployerContext();
  const { address: me } = useAccount();
  const selectedRow = ctx.selectedRow;

  const [identity, setIdentity] = useState<EmployeeIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  useEffect(() => {
    if (!selectedRow || !me) {
      setIdentity(null);
      return;
    }

    let cancelled = false;
    setIdentityLoading(true);

    getEmployeeIdentity(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id },
      me
    )
      .then((value) => {
        if (!cancelled) setIdentity(value);
      })
      .catch(() => {
        if (!cancelled) setIdentity(null);
      })
      .finally(() => {
        if (!cancelled) setIdentityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRow?.employment_chain_binding_id, me]);

  async function onSavePii(
    updates: Omit<UpdateEmployeePiiParams, "employment_chain_binding_id">
  ) {
    if (!selectedRow || !me) throw new Error("No employee selected");

    await updateEmployeePii(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id, ...updates },
      me
    );

    const fresh = await getEmployeeIdentity(
      { employment_chain_binding_id: selectedRow.employment_chain_binding_id },
      me
    );
    setIdentity(fresh);
  }

  return {
    locale: ctx.locale,
    selectedRow,
    identity,
    identityLoading,
    underlyingSymbol: ctx.underlyingSymbol,
    updateSalaryInput: ctx.updateSalaryInput,
    setUpdateSalaryInput: ctx.setUpdateSalaryInput,
    computedEmployeePayrollPeriod: ctx.computedEmployeePayrollPeriod,
    computedEmployeeRunId: ctx.computedEmployeeRunId,
    onUpdateEmployeeOffchain: ctx.onUpdateEmployeeOffchain,
    onUpdateSalary: ctx.onUpdateSalary,
    onRunPayrollSingle: ctx.onRunPayrollSingle,
    onSavePii,
  };
}
