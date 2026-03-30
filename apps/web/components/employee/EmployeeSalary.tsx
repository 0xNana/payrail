"use client";

import Link from "next/link";
import { type Address } from "viem";
import { Button } from "@/components/ui/button";
import { EmployeePageShell } from "@/components/employee/EmployeePageShell";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

interface EmployeeSalaryProps {
  locale: Locale;
  chainId?: number;
  canUseFhe: boolean;
  tokenSymbol: string;
  tokenDecimals: number;
  underlyingAddr?: Address;
  bindings: any[];
  bindingsLoading: boolean;
  bindingsError: string | null;
  selectedPayroll: Address | "";
  onSelectPayroll: (addr: Address | "") => void;
  salaryHandle?: string;
  salaryPlain: bigint | null;
  salaryFormatted: string | null;
  onDecryptSalary: () => Promise<void>;
  status: string;
}

export function EmployeeSalary({
  locale,
  tokenSymbol,
  tokenDecimals,
  bindings,
  selectedPayroll,
  onSelectPayroll,
  salaryHandle,
  salaryPlain,
  salaryFormatted,
  onDecryptSalary,
  status,
}: EmployeeSalaryProps) {
  const dict = useDictionary(locale);
  if (!dict) return null;

  const t = dict.employeePage;
  const tCompany = dict.employeeCompanySelector;
  const tSalary = dict.employeeSalaryPanel;
  const tSidebar = dict.employeeSidebar as any;

  return (
    <EmployeePageShell
      locale={locale}
      currentPath={`/${locale}/employee/salary`}
      title={tSalary.salaryTitle}
      subtitle={t.securedByFhe}
      status={status}
    >
      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-label">{tCompany.title}</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tCompany.selectCompany}</h2>
          </div>
        </div>

        {bindings.length > 0 && (
          <div className="rounded-2xl border border-border/70 bg-card p-4 dark:bg-[rgba(16,22,30,0.9)]">
            {bindings.length === 1 ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-xl border border-border/60 bg-background/70 px-3 py-1 text-sm font-medium">
                  {bindings[0].company_name}
                </span>
                <code className="rounded-xl border border-border/60 bg-background/70 px-3 py-1 font-mono text-xs">
                  {bindings[0].payroll_contract_address.slice(0, 10)}...
                </code>
              </div>
            ) : (
              <div className="grid gap-2">
                <label className="section-label">{tCompany.selectCompany}</label>
                <select
                  value={selectedPayroll}
                  onChange={(e) => onSelectPayroll(e.target.value as Address)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-0 transition-colors focus:border-ring"
                >
                  <option value="">{tCompany.selectPlaceholder}</option>
                  {bindings.map((b) => (
                    <option key={b.payroll_contract_address} value={b.payroll_contract_address}>
                      {b.company_name} — {b.payroll_contract_address.slice(0, 10)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card dark:bg-[rgba(16,22,30,0.9)]">
            <div className="border-b border-border/70 px-5 py-4">
              <div className="section-label">{tSalary.handle}</div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{tSalary.salaryTitle}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{tSidebar.salaryDescription}</p>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-border/70 px-5 py-6 lg:border-b-0 lg:border-r">
                <div className="section-label">{selectedPayroll ? "Active payroll" : "Selection required"}</div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {selectedPayroll
                    ? "Encrypted salary is available for decryption by the connected employee wallet."
                    : "Choose a payroll binding before requesting plaintext salary output."}
                </p>
                <div className="mt-6">
                  <Button onClick={onDecryptSalary} disabled={!selectedPayroll} size="lg">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {tSalary.decryptSalary}
                  </Button>
                </div>
                {!selectedPayroll && <p className="mt-3 text-xs text-muted-foreground">{tSidebar.selectCompanyToView}</p>}
              </div>

              <div className="px-5 py-6">
                <div className="section-label">Decrypted output</div>
                {salaryPlain !== null ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                      <div className="section-label text-emerald-700 dark:text-emerald-200">{tSidebar.decryptedSalary}</div>
                      <div className="mt-2 text-4xl font-semibold tracking-tight">
                        {salaryFormatted} {tokenSymbol}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                        <div className="section-label">Handle</div>
                        <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{salaryHandle ?? "Unavailable"}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                        <div className="section-label">Token profile</div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {tokenSymbol} with {tokenDecimals} decimals
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-background/35 p-5 text-sm text-muted-foreground">
                    No decrypted salary has been requested in this session.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-border/70 bg-card p-5 dark:bg-[rgba(16,22,30,0.9)]">
              <div className="section-label">Access policy</div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>Salary remains encrypted on-chain until the employee explicitly decrypts it.</div>
                <div>Only the connected wallet associated with the payroll binding can inspect plaintext values.</div>
                <div>Token configuration: {tokenSymbol} with {tokenDecimals} decimals.</div>
              </div>
            </section>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card dark:bg-[rgba(16,22,30,0.9)]">
              <Link href={`/${locale}/employee/balance`} className="block border-b border-border/70 px-5 py-4 transition-colors hover:bg-muted/35">
                <div className="section-label">Next surface</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">Balance</h3>
                <p className="mt-2 text-sm text-muted-foreground">Review confidential balance and last payment history.</p>
              </Link>
              <Link href={`/${locale}/employee/help`} className="block px-5 py-4 transition-colors hover:bg-muted/35">
                <div className="section-label">Support</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{tSidebar.help}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{dict.common?.support}</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </EmployeePageShell>
  );
}
