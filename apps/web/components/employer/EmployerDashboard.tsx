"use client";

import { useMemo, useState } from "react";
import { type Address } from "viem";

import { DeleteCompanyButton } from "@/components/employer/DeleteCompanyButton";
import { ProductFooter } from "@/components/ProductFooter";
import { useDictionary } from "@/lib/useDictionary";
import { Sidebar } from "@/components/Sidebar";
import { useEmployerContext } from "@/app/[lang]/employer/EmployerContext";

import { RegisterEmployeeForm } from "./RegisterEmployeeForm";
import { EmployeeRoster } from "./EmployeeRoster";
import { EditEmployeePanel } from "./EditEmployeePanel";
import { PayrollConfirmModal } from "./PayrollConfirmModal";
import { useEmployerEmployeeRecord } from "./useEmployerEmployeeRecord";
import {
  EmployerConfidentialInspector,
  EmployerDashboardAlerts,
  EmployerDashboardHeader,
  EmployerDashboardStatusBanner,
  EmployerEditEmptyState,
  EmployerFundingPanel,
  EmployerOperatorPanel,
  EmployerPayrollExplainer,
  EmployerTreasuryPanel,
} from "./EmployerDashboardSections";

export function EmployerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ctx = useEmployerContext();
  const employeeRecord = useEmployerEmployeeRecord();
  const dict = useDictionary(ctx.locale);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  const selectedRow = useMemo(() => {
    if (!ctx.selectedEmployee) return null;
    const sel = String(ctx.selectedEmployee).toLowerCase();
    return ctx.rosterRows.find((r) => String(r.wallet_address).toLowerCase() === sel) ?? null;
  }, [ctx.rosterRows, ctx.selectedEmployee]);

  if (!dict) return null;
  const t = dict.employerDashboard as any;

  const operatorIsActive = ctx.operatorStatus !== false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PayrollConfirmModal
        open={showPayrollModal}
        onOpenChange={setShowPayrollModal}
        payrollAddr={ctx.payrollAddr}
        operatorStatus={ctx.operatorStatus}
        operatorDays={ctx.operatorDays}
        activeEmployeeCount={ctx.activeEmployeeCount}
        activeCadenceCount={ctx.activeCadenceCount}
        selectedEmployee={ctx.selectedEmployee}
        onRunBatch={ctx.onRunPayrollBatch}
        onRunSingle={ctx.onRunPayrollSingle}
        onScrollToOperator={() => {
          const el = document.getElementById("operator-controls");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* Sidebar */}
      <Sidebar
        locale={ctx.locale}
        variant="employer"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={`/employer`}
      />

      <EmployerDashboardHeader
        title={t.title}
        subtitle={t.securedByFhe}
        activeEmployeeCount={ctx.activeEmployeeCount}
        onOpenSidebar={() => setSidebarOpen(true)}
        onExportCsv={ctx.onExportCsv}
        onOpenPayrollModal={() => setShowPayrollModal(true)}
      />

      {/* Main */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        <EmployerDashboardStatusBanner status={ctx.status} />

        <EmployerDashboardAlerts
          hasCompany={ctx.hasCompany}
          backendSynced={ctx.backendSynced}
          supabaseError={ctx.supabaseError}
          noCompanyWarning={t.noCompanyWarning}
          supabaseNotSynced={t.supabaseNotSynced}
          supabaseErrorLabel={t.supabaseError}
        />

        <EmployerPayrollExplainer
          activeEmployeeCount={ctx.activeEmployeeCount}
          activeCadenceCount={ctx.activeCadenceCount}
          t={t}
        />

        <EmployerFundingPanel
          title={t.fundingSection.title}
          underlyingLabel={t.fundingSection.underlyingLabel}
          symbolLabel={t.fundingSection.symbolLabel}
          decimalsLabel={t.fundingSection.decimalsLabel}
          balanceLabel={t.fundingSection.balanceLabel}
          amountToWrapLabel={t.fundingSection.amountToWrapLabel}
          approveButton={t.fundingSection.approveButton}
          wrapButton={t.fundingSection.wrapButton}
          flowNote={t.fundingSection.flowNote}
          underlyingAddr={ctx.underlyingAddr}
          underlyingSymbol={ctx.underlyingSymbol}
          underlyingDecimalsValue={ctx.underlyingDecimalsValue}
          underlyingBalanceFormatted={ctx.underlyingBalanceFormatted}
          wrapAmountInput={ctx.wrapAmountInput}
          setWrapAmountInput={ctx.setWrapAmountInput}
          onApproveWrap={ctx.onApproveWrap}
          onWrap={ctx.onWrap}
        />

        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-6">
          <EmployerTreasuryPanel
            title={t.confidentialTreasury}
            encryptedBalanceLabel={t.encryptedBalance}
            decryptLabel={t.decrypt}
            note={t.decryptionNote}
            employerConfidentialBalanceFormatted={ctx.employerConfidentialBalanceFormatted}
            underlyingSymbol={ctx.underlyingSymbol}
            onDecryptBalance={ctx.onDecryptBalance}
          />

          {/* Employee Roster */}
          <div className="col-span-2">
            <EmployeeRoster
              rows={ctx.rosterRows}
              loading={ctx.rosterLoading}
              onSelect={ctx.onSelectEmployee}
              onRemove={ctx.onRemoveEmployee}
              t={dict.employeeRoster}
              selectedEmployee={ctx.selectedEmployee}
              onSelectEmployee={ctx.onSelectEmployee}
              onDecryptSalary={ctx.onDecryptSalary}
              onDecryptLastPayment={ctx.onDecryptLastPayment}
              selectedSalaryPlain={ctx.selectedSalaryPlain}
              selectedSalaryFormatted={ctx.selectedSalaryFormatted}
              selectedLastPaymentPlain={ctx.selectedLastPaymentPlain}
              selectedLastPaymentFormatted={ctx.selectedLastPaymentFormatted}
              underlyingSymbol={ctx.underlyingSymbol}
              tConfidential={{
                confidentialView: t.confidentialView,
                salaryPlaintext: t.salaryPlaintext,
                historyDecryption: t.historyDecryption,
                decryptionWarning: t.decryptionWarning,
              }}
              onRunPayroll={(row) => ctx.onSelectEmployee(row.wallet_address as Address)}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RegisterEmployeeForm
              payrollAddr={ctx.payrollAddr}
              payrollAbi={ctx.payrollAbi!}
              companyOnchainBindingId={ctx.companyOnchainBindingId ?? ""}
              underlyingDecimals={ctx.underlyingDecimalsValue}
              underlyingSymbol={ctx.underlyingSymbol}
              onSuccess={ctx.onSuccess}
              t={dict.registerEmployeeForm}
            />
          </div>

          <EmployerOperatorPanel
            operatorControls={t.operatorControls}
            statusLabel={operatorIsActive ? (dict.common?.active ?? "Active") : (dict.common?.inactive ?? "Inactive")}
            isActive={operatorIsActive}
            operatorStatusText={operatorIsActive ? "active" : "inactive"}
            statusTitle={t.isOperatorStatus}
            activeExplanation={t.operatorExplainActive ?? "Active means the Payroll contract is allowed to transfer confidential tokens from your balance to employees during payroll runs."}
            inactiveExplanation={t.operatorExplainInactive ?? "Inactive means the Payroll contract cannot move funds from your confidential balance. Payroll runs will revert until you grant operator approval."}
            renewalPeriodDays={t.renewalPeriodDays}
            operatorDays={ctx.operatorDays}
            setOperatorDays={ctx.setOperatorDays}
            onSetOperator={ctx.onSetOperator}
            enableLabel={t.enableOperator ?? "ENABLE OPERATOR"}
            renewLabel={t.renewOperator ?? "RENEW OPERATOR"}
            operatorExplain={t.operatorExplain ?? "This approval allows the Payroll contract to transfer confidential tokens from your employer wallet only when you confirm a payroll transaction. You can revoke or let it expire anytime."}
            inactiveHint={t.operatorCtaHintInactive ?? "This will submit a transaction to approve the Payroll contract as operator until the expiry you choose (in days)."}
            activeHint={t.operatorCtaHintActive ?? "Submitting again extends the expiry. You can keep this short and renew as needed."}
            revokeLabel={t.revokeAllAccess}
            revokeTitle={t.revokeNotImplemented ?? "Not implemented"}
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-6">
          {/* Edit Employee Panel */}
          <div className="col-span-2">
            {selectedRow ? (
              <EditEmployeePanel
                row={selectedRow}
                identity={employeeRecord.identity}
                identityLoading={employeeRecord.identityLoading}
                onSavePii={employeeRecord.onSavePii}
                onSaveOffchain={(updates) => ctx.onUpdateEmployeeOffchain(selectedRow, updates)}
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
              <EmployerEditEmptyState
                title={t.editEmployeeTitle ?? "Edit employee"}
                body={t.editEmployeeEmptyState ?? "Select an employee from the roster to edit off-chain fields and update salary."}
                hint={t.editEmployeeEmptyStateHint ?? "Tip: clicking a row in the roster will select it."}
              />
            )}
          </div>

          <EmployerConfidentialInspector
            title={t.confidentialView}
            selectEmployee={t.selectEmployee}
            selectFromRoster={t.selectFromRoster}
            salaryPlaintext={t.salaryPlaintext}
            historyDecryption={t.historyDecryption}
            decryptionWarning={t.decryptionWarning}
            rosterRows={ctx.rosterRows}
            selectedEmployee={ctx.selectedEmployee}
            onSelectEmployee={ctx.onSelectEmployee}
            selectedSalaryPlain={ctx.selectedSalaryPlain}
            selectedSalaryFormatted={ctx.selectedSalaryFormatted}
            selectedLastPaymentPlain={ctx.selectedLastPaymentPlain}
            selectedLastPaymentFormatted={ctx.selectedLastPaymentFormatted}
            underlyingSymbol={ctx.underlyingSymbol}
            onDecryptSalary={ctx.onDecryptSalary}
            onDecryptLastPayment={ctx.onDecryptLastPayment}
          />
        </div>
      </main>

      {/* Danger Zone */}
      {ctx.hasCompany && (
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <DeleteCompanyButton companyName={ctx.companyName} onDeleteCompany={ctx.onDeleteCompany} />
        </div>
      )}

      <ProductFooter locale={ctx.locale} className="mt-12" />
    </div>
  );
}
