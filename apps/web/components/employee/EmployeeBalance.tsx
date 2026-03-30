"use client";

import Link from "next/link";
import { type Address } from "viem";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeePageShell } from "@/components/employee/EmployeePageShell";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

interface EmployeeBalanceProps {
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
  lastPaymentHandle?: string;
  lastPaymentPlain: bigint | null;
  lastPaymentFormatted: string | null;
  lastRunId?: string;
  onDecryptLastPayment: () => Promise<void>;
  balanceHandle?: string;
  balancePlain: bigint | null;
  balanceFormatted: string | null;
  onDecryptBalance: () => Promise<void>;
  userAddress?: Address;
  onRequestUnwrap: (amountRaw: bigint, toAddress: Address) => Promise<void>;
  isUnwrapping: boolean;
  status: string;
}

export function EmployeeBalance({
  locale,
  tokenSymbol,
  tokenDecimals,
  bindings,
  selectedPayroll,
  onSelectPayroll,
  lastPaymentPlain,
  lastPaymentFormatted,
  lastRunId,
  onDecryptLastPayment,
  balancePlain,
  balanceFormatted,
  onDecryptBalance,
  userAddress,
  status,
}: EmployeeBalanceProps) {
  const dict = useDictionary(locale);

  if (!dict) return null;

  const t = dict.employeePage;
  const tCompany = dict.employeeCompanySelector;
  const tSalary = dict.employeeSalaryPanel;
  const tBalance = dict.employeeBalancePanel;
  const tSidebar = dict.employeeSidebar as any;

  return (
    <EmployeePageShell
      locale={locale}
      currentPath={`/${locale}/employee/balance`}
      title={tBalance.title}
      subtitle={t.securedByFhe}
      status={status}
    >
      {bindings.length > 0 && (
        <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="section-label">{tCompany.title}</div>
                <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">{tCompany.selectCompany}</CardTitle>
              </div>
              <div className="metric-chip">{bindings.length} payroll link{bindings.length === 1 ? "" : "s"}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bindings.length === 1 ? (
              <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="section-label">{tCompany.company}</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="rounded-full px-3 py-1">{bindings[0].company_name}</Badge>
                  <code className="rounded-full border border-border/60 bg-background/70 px-3 py-1 font-mono text-xs">
                    {bindings[0].payroll_contract_address.slice(0, 10)}...
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="section-label">{tCompany.selectCompany}</label>
                <select
                  value={selectedPayroll}
                  onChange={(e) => onSelectPayroll(e.target.value as Address)}
                  className="h-14 w-full rounded-[20px] border border-input bg-background/80 px-4 text-sm outline-none transition-colors focus:border-ring"
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
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-sky-500/15 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),rgba(255,255,255,0.7))] dark:bg-[linear-gradient(180deg,rgba(14,165,233,0.18),rgba(7,18,36,0.78))]">
          <CardHeader className="pb-6">
            <div className="section-label">{tBalance.handle}</div>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">{tBalance.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{tSidebar.balanceDescription}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[28px] border border-white/35 bg-white/80 p-8 dark:border-white/10 dark:bg-white/5">
              <div className="text-center space-y-6">
                <p className="section-label">{balancePlain !== null ? "Confidential balance available" : "Decrypt confidential balance"}</p>
                <div className="flex justify-center py-4">
                  <div className="flex gap-1">
                    {[...Array(14)].map((_, i) => (
                      <div key={i} className="h-3 w-3 rounded-full bg-sky-500/25 animate-pulse" />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button onClick={onDecryptBalance} disabled={!userAddress} size="lg">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    {tBalance.decryptButton}
                  </Button>
                  {!userAddress && (
                    <p className="text-xs text-muted-foreground">
                      {(tSidebar as any).noDataFound || "No balance data found. Make sure you are registered as an employee."}
                    </p>
                  )}
                </div>

                {balancePlain !== null && (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5">
                      <p className="section-label text-emerald-700 dark:text-emerald-200">
                        {(tSidebar as any).decryptedBalance || "Balance in plaintext"}
                      </p>
                      <p className="mt-2 text-4xl font-semibold tracking-tight">
                        {balanceFormatted} {tokenSymbol}
                      </p>
                    </div>

                    {balancePlain > 0n && (
                      <div className="rounded-[24px] border border-white/30 bg-white/70 p-5 text-left dark:border-white/10 dark:bg-white/5">
                        <div className="section-label">CoFHE balance model</div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Payrail balances stay encrypted on-chain. Public unwrap is intentionally disabled in this runtime, so employee balances remain confidential.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedPayroll && (
            <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
              <CardHeader className="pb-4">
                  <div className="section-label">Payment history</div>
                <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
                  {(tBalance as any).lastPaymentTitle || (tSidebar as any).lastPayment || "Last Payment"}
                </CardTitle>
                {lastRunId && (
                  <p className="text-xs text-muted-foreground">
                    {tSalary.lastRunId}: <code className="font-mono text-xs">{lastRunId}</code>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="rounded-[24px] border border-white/30 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center py-2">
                      <div className="flex gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="h-3 w-3 rounded-full bg-slate-400/25 animate-pulse" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button onClick={onDecryptLastPayment} variant="outline" size="lg" disabled={!selectedPayroll}>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        {(tBalance as any).decryptLastPaymentButton || tSalary.decryptLastPayment || "Decrypt Last Payment"}
                      </Button>
                      {!selectedPayroll && (
                        <p className="text-xs text-muted-foreground">
                          {(tSidebar as any).noDataFound || "No payment data found yet."}
                        </p>
                      )}
                    </div>

                    {lastPaymentPlain !== null && (
                      <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <p className="section-label text-emerald-700 dark:text-emerald-200">
                          {(tSidebar as any).decryptedLastPayment || "Last payment in plaintext"}
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                          {lastPaymentFormatted} {tokenSymbol}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href={`/${locale}/employee/salary`}>
              <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Compensation</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Salary</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Review encrypted compensation and decryption controls.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/${locale}/employee/settings`}>
              <Card className="h-full border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Configuration</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Settings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Check network posture, token details, and personal preferences.</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-white/40 bg-white/72 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
            <CardContent className="p-5">
              <div className="section-label">Token profile</div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{tokenSymbol}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Employee-side decrypt output uses a {tokenDecimals}-decimal confidential token representation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeePageShell>
  );
}
