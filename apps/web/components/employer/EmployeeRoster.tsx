"use client";

import React from "react";
import type { Address } from "viem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmployerRosterRow } from "@/lib/supabasePayroll";
import type { Dictionary } from "@/lib/useDictionary";

type ConfidentialT = {
  confidentialView: string;
  salaryPlaintext: string;
  historyDecryption: string;
  decryptionWarning: string;
};

type Props = {
  rows: EmployerRosterRow[];
  loading: boolean;
  onSelect: (addr: Address) => void;
  onRemove: (row: EmployerRosterRow) => void;
  t: Dictionary["employeeRoster"];
  selectedEmployee: Address | "";
  onSelectEmployee: (addr: Address | "") => void;
  onDecryptSalary: () => Promise<void>;
  onDecryptLastPayment: () => Promise<void>;
  selectedSalaryPlain: bigint | null;
  selectedSalaryFormatted: string | null;
  selectedLastPaymentPlain: bigint | null;
  selectedLastPaymentFormatted: string | null;
  underlyingSymbol: string;
  tConfidential: ConfidentialT;
  onRunPayroll: (row: EmployerRosterRow) => void;
};

function cadenceLabel(c: string | undefined) {
  if (!c) return "—";
  if (c === "semiMonthly") return "semi-monthly";
  return c;
}

export function EmployeeRoster({
  rows,
  loading,
  onSelect,
  onRemove,
  t,
  selectedEmployee,
  onSelectEmployee,
  onDecryptSalary,
  onDecryptLastPayment,
  selectedSalaryPlain,
  selectedSalaryFormatted,
  selectedLastPaymentPlain,
  selectedLastPaymentFormatted,
  underlyingSymbol,
  tConfidential,
  onRunPayroll,
}: Props) {
  const activeCount = rows.filter((r) => r.active).length;

  function toggleDecrypt(addr: Address) {
    onSelectEmployee(selectedEmployee === addr ? "" : addr);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-label">Employee roster</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length} {t.total} and {activeCount} {t.active}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-transparent">
            {t.count}: {rows.length}
          </Badge>
          <Badge variant="outline" className="bg-transparent">
            Active: {activeCount}
          </Badge>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card dark:bg-[rgba(16,22,30,0.9)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-border/70 bg-muted/35">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnWallet}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnJobTitle}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnSince}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnCadence ?? "Cadence"}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnNextDue ?? "Next due"}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnStatus}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.columnActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t.loading}
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t.empty}
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => {
                  const isExpanded = selectedEmployee === row.wallet_address;
                  return (
                    <React.Fragment key={row.employment_chain_binding_id}>
                      <tr className="border-b border-border/70 transition-colors hover:bg-muted/25">
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-muted-foreground">
                            {row.wallet_address.slice(0, 10)}…{row.wallet_address.slice(-8)}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {row.job_title ?? <span className="text-muted-foreground/60">{t.noTitle}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{row.start_date}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{cadenceLabel(row.payroll_cadence)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {row.next_pay_date ? (
                            <div className="space-y-0.5">
                              <div>{row.next_pay_date}</div>
                              <div className="font-mono text-[10px] text-muted-foreground/70">{row.next_period_code ?? "—"}</div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={row.active ? "border-success/30 bg-success/10 text-success-foreground" : "bg-transparent text-muted-foreground"}
                          >
                            {row.active ? t.statusActive : t.statusInactive}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onSelect(row.wallet_address)}
                              title={t.inspect}
                              className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              ✎
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleDecrypt(row.wallet_address)}
                              title={tConfidential.confidentialView}
                              className={`h-7 w-7 transition-colors ${isExpanded ? "text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                              </svg>
                            </Button>
                            {row.active && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Run payroll for this employee"
                                onClick={() => onRunPayroll(row)}
                                className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </Button>
                            )}
                            {row.active && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t.remove}
                                onClick={() => {
                                  if (confirm(t.removeConfirm)) onRemove(row);
                                }}
                                className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                🗑
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-border/70 bg-muted/20">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                                <div className="section-label">{tConfidential.salaryPlaintext}</div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {[...Array(8)].map((_, i) => (
                                      <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/35" />
                                    ))}
                                  </div>
                                  <Button onClick={onDecryptSalary} variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                  </Button>
                                </div>
                                {selectedSalaryPlain !== null && (
                                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <div className="section-label text-emerald-700 dark:text-emerald-200">Plaintext</div>
                                    <p className="mt-2 font-mono text-sm text-foreground">
                                      {selectedSalaryFormatted} {underlyingSymbol}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                                <div className="section-label">{tConfidential.historyDecryption}</div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {[...Array(8)].map((_, i) => (
                                      <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/35" />
                                    ))}
                                  </div>
                                  <Button onClick={onDecryptLastPayment} variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                  </Button>
                                </div>
                                {selectedLastPaymentPlain !== null && (
                                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                    <div className="section-label text-emerald-700 dark:text-emerald-200">Last payment</div>
                                    <p className="mt-2 font-mono text-sm text-foreground">
                                      {selectedLastPaymentFormatted} {underlyingSymbol}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 text-center text-[10px] leading-relaxed text-muted-foreground whitespace-pre-line">
                              {tConfidential.decryptionWarning}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
