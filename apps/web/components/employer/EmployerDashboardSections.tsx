"use client";

import type { Address } from "viem";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type HeaderProps = {
  title: string;
  subtitle: string;
  activeEmployeeCount: number;
  onOpenSidebar: () => void;
  onExportCsv: () => void;
  onOpenPayrollModal: () => void;
};

export function EmployerDashboardHeader({
  title,
  subtitle,
  activeEmployeeCount,
  onOpenSidebar,
  onExportCsv,
  onOpenPayrollModal,
}: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />

            <Button
              variant="outline"
              onClick={onExportCsv}
              className="h-9 border-border px-4 text-foreground hover:bg-accent"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>

            <Button
              onClick={onOpenPayrollModal}
              disabled={activeEmployeeCount === 0}
              className="h-9 bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              title={activeEmployeeCount === 0 ? "No active employees to pay." : ""}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run payroll
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

type BannerProps = {
  status: string;
};

export function EmployerDashboardStatusBanner({ status }: BannerProps) {
  if (!status) return null;

  return (
    <div
      className={`px-4 py-3 border text-sm ${
        status.startsWith("✅")
          ? "border-success/20 bg-success/10 text-success-foreground"
          : "border-destructive/20 bg-destructive/10 text-destructive-foreground"
      }`}
    >
      {status}
    </div>
  );
}

type AlertsProps = {
  hasCompany: boolean;
  backendSynced: boolean;
  supabaseError: string | null;
  noCompanyWarning: string;
  supabaseNotSynced: string;
  supabaseErrorLabel: string;
};

export function EmployerDashboardAlerts({
  hasCompany,
  backendSynced,
  supabaseError,
  noCompanyWarning,
  supabaseNotSynced,
  supabaseErrorLabel,
}: AlertsProps) {
  return (
    <>
      {!hasCompany && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-4">
            <p className="text-destructive-foreground">{noCompanyWarning}</p>
          </CardContent>
        </Card>
      )}

      {hasCompany && !backendSynced && (
        <Card className="border-warning/20 bg-warning/10">
          <CardContent className="pt-4">
            <p className="text-warning-foreground">{supabaseNotSynced}</p>
          </CardContent>
        </Card>
      )}

      {supabaseError && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-4">
            <p className="text-destructive-foreground">
              {supabaseErrorLabel}: {supabaseError}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

type ExplainerProps = {
  activeEmployeeCount: number;
  activeCadenceCount: number;
  t: Record<string, string>;
};

export function EmployerPayrollExplainer({ activeEmployeeCount, activeCadenceCount, t }: ExplainerProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.howPayrollWorksTitle ?? "How payroll works"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {(t.activeEmployeesLabel ?? "Active employees")}: {activeEmployeeCount}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {(t.cadenceGroupsLabel ?? "Cadence groups")}: {activeCadenceCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          {t.howPayrollWorksLine1 ??
            "This contract does not schedule payments. Payroll executes immediately when you confirm and the transaction is mined."}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            {t.howPayrollWorksBullet1 ??
              "You set each employee’s encrypted salary. The contract can pay only that encrypted amount."}
          </li>
          <li>
            {t.howPayrollWorksBullet2 ??
              "Batch payroll is grouped by employee cadence (monthly/weekly/etc). Each cadence group may require a separate on-chain transaction."}
          </li>
          <li>
            {t.howPayrollWorksBullet3 ??
              "To avoid double paying, each run uses a runId. The contract blocks paying the same employee twice for the same runId."}
          </li>
          <li>
            {t.howPayrollWorksBullet4 ??
              "Operator approval is required so the payroll contract can move funds from your confidential balance to employees."}
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          {t.howPayrollWorksFootnote ??
            "The roster can show a ‘next due’ hint based on off-chain cadence settings. On-chain, only ‘already paid in this runId’ is enforced."}
        </p>
      </CardContent>
    </Card>
  );
}

type FundingProps = {
  title: string;
  underlyingLabel: string;
  symbolLabel: string;
  decimalsLabel: string;
  balanceLabel: string;
  amountToWrapLabel: string;
  approveButton: string;
  wrapButton: string;
  flowNote: string;
  underlyingAddr?: string;
  underlyingSymbol: string;
  underlyingDecimalsValue: number;
  underlyingBalanceFormatted: string;
  wrapAmountInput: string;
  setWrapAmountInput: (value: string) => void;
  onApproveWrap: () => Promise<void>;
  onWrap: () => Promise<void>;
};

export function EmployerFundingPanel(props: FundingProps) {
  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {props.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{props.underlyingLabel}</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">{String(props.underlyingAddr ?? "(loading)")}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{props.symbolLabel}</span>
            <span className="text-xs">{props.underlyingSymbol ?? "USDC"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{props.decimalsLabel}</span>
            <span className="text-xs">{String(props.underlyingDecimalsValue ?? "(loading)")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{props.balanceLabel}</span>
            <Badge variant="default">
              {props.underlyingBalanceFormatted} {props.underlyingSymbol}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            {props.amountToWrapLabel} ({props.underlyingSymbol})
          </label>
          <Input
            value={props.wrapAmountInput}
            onChange={(e) => props.setWrapAmountInput(e.target.value)}
            placeholder="100"
            type="number"
            className="bg-background"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={props.onApproveWrap} variant="outline" size="sm">
            {props.approveButton}
          </Button>
          <Button onClick={props.onWrap} variant="default" size="sm">
            {props.wrapButton}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{props.flowNote}</p>
      </CardContent>
    </Card>
  );
}

type TreasuryProps = {
  title: string;
  encryptedBalanceLabel: string;
  decryptLabel: string;
  note: string;
  employerConfidentialBalanceFormatted: string | null;
  underlyingSymbol: string;
  onDecryptBalance: () => Promise<void>;
};

export function EmployerTreasuryPanel({
  title,
  encryptedBalanceLabel,
  decryptLabel,
  note,
  employerConfidentialBalanceFormatted,
  underlyingSymbol,
  onDecryptBalance,
}: TreasuryProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded bg-background p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{encryptedBalanceLabel}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              ))}
            </div>
            <Button
              onClick={onDecryptBalance}
              variant="outline"
              className="h-8 border-primary bg-transparent px-3 text-xs text-primary hover:bg-primary/10"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              {decryptLabel}
            </Button>
          </div>

          {employerConfidentialBalanceFormatted !== null && (
            <p className="mt-3 text-lg font-mono text-foreground">
              {employerConfidentialBalanceFormatted} {underlyingSymbol}
            </p>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

type OperatorProps = {
  operatorControls: string;
  statusLabel: string;
  isActive: boolean;
  operatorStatusText: string;
  statusTitle: string;
  activeExplanation: string;
  inactiveExplanation: string;
  renewalPeriodDays: string;
  operatorDays: string;
  setOperatorDays: (value: string) => void;
  onSetOperator: () => Promise<void>;
  enableLabel: string;
  renewLabel: string;
  operatorExplain: string;
  inactiveHint: string;
  activeHint: string;
  revokeLabel: string;
  revokeTitle: string;
};

export function EmployerOperatorPanel(props: OperatorProps) {
  return (
    <Card id="operator-controls" className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {props.operatorControls}
          </CardTitle>
          <Badge
            variant="default"
            className={`text-[10px] px-2 py-0.5 ${
              props.isActive
                ? "border-success/30 bg-success/20 text-success-foreground"
                : "border-destructive/30 bg-destructive/15 text-destructive-foreground"
            }`}
          >
            {props.statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 rounded bg-muted p-3">
          <p className="text-sm font-medium text-foreground">{props.statusTitle}</p>
          <p className="text-xs text-muted-foreground">
            {props.isActive ? props.activeExplanation : props.inactiveExplanation}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{props.renewalPeriodDays}</p>

          <div className="flex gap-2">
            <Input
              value={props.operatorDays}
              onChange={(e) => props.setOperatorDays(e.target.value)}
              className="h-9 flex-1 border-border bg-muted text-sm text-foreground"
            />

            <Button onClick={props.onSetOperator} className="h-9 bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90">
              {props.isActive ? props.renewLabel : props.enableLabel}
            </Button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{props.operatorExplain}</p>
          <p className="mt-2 text-xs text-muted-foreground">{props.isActive ? props.activeHint : props.inactiveHint}</p>
        </div>

        <Button
          variant="destructive"
          disabled
          className="mt-2 h-9 w-full border border-destructive/20 bg-destructive/10 text-sm text-destructive-foreground hover:bg-destructive/20 disabled:opacity-60"
          title={props.revokeTitle}
        >
          {props.revokeLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

type ConfidentialInspectorProps = {
  title: string;
  selectEmployee: string;
  selectFromRoster: string;
  salaryPlaintext: string;
  historyDecryption: string;
  decryptionWarning: string;
  rosterRows: Array<{ wallet_address: string; job_title?: string | null }>;
  selectedEmployee: Address | "";
  onSelectEmployee: (addr: Address | "") => void;
  selectedSalaryPlain: bigint | null;
  selectedSalaryFormatted: string | null;
  selectedLastPaymentPlain: bigint | null;
  selectedLastPaymentFormatted: string | null;
  underlyingSymbol: string;
  onDecryptSalary: () => Promise<void>;
  onDecryptLastPayment: () => Promise<void>;
};

export function EmployerConfidentialInspector(props: ConfidentialInspectorProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {props.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{props.selectEmployee}</p>
          <select
            value={props.selectedEmployee}
            onChange={(e) => props.onSelectEmployee(e.target.value as Address)}
            className="w-full rounded bg-background px-3 text-sm font-mono text-foreground h-9 border-border"
          >
            <option value="">{props.selectFromRoster}</option>
            {props.rosterRows.map((row) => (
              <option key={row.wallet_address} value={row.wallet_address}>
                {row.wallet_address.slice(0, 6)}...{row.wallet_address.slice(-4)}
                {row.job_title ? ` — ${row.job_title}` : ""}
              </option>
            ))}
          </select>
        </div>

        {props.selectedEmployee && (
          <>
            <ConfidentialDataBox
              title={props.salaryPlaintext}
              value={props.selectedSalaryPlain !== null ? `${props.selectedSalaryFormatted} ${props.underlyingSymbol}` : null}
              onDecrypt={props.onDecryptSalary}
              icon="lock"
            />
            <ConfidentialDataBox
              title={props.historyDecryption}
              value={props.selectedLastPaymentPlain !== null ? `${props.selectedLastPaymentFormatted} ${props.underlyingSymbol}` : null}
              onDecrypt={props.onDecryptLastPayment}
              icon="chart"
            />
            <p className="whitespace-pre-line text-center text-[10px] leading-relaxed text-muted-foreground">
              {props.decryptionWarning}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ConfidentialDataBox({
  title,
  value,
  onDecrypt,
  icon,
}: {
  title: string;
  value: string | null;
  onDecrypt: () => Promise<void>;
  icon: "lock" | "chart";
}) {
  return (
    <div className="rounded bg-background p-4">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          ))}
        </div>
        <Button onClick={onDecrypt} variant="ghost" size="icon" className="w-8 h-8 text-primary hover:bg-primary/10">
          {icon === "lock" ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        </Button>
      </div>
      {value && <p className="mt-2 text-sm font-mono text-foreground">{value}</p>}
    </div>
  );
}

export function EmployerEditEmptyState({ title, body, hint }: { title: string; body: string; hint: string }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground">{body}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
