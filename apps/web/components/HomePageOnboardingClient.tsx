"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type Address, keccak256, stringToHex } from "viem";
import { ChevronRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { getContracts } from "@/lib/contracts";
import { upsertCompanyRegistration, getEmployerCompanyBinding } from "@/lib/supabasePayroll";
import { TARGET_PAYROLL_CHAIN_NAME, targetPayrollChain } from "@/lib/targetChain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/lib/useDictionary";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function HomePageOnboardingClient({ locale, dict }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [countryCode, setCountryCode] = useState("ES");
  const [pendingCompanyDraft, setPendingCompanyDraft] = useState<{
    company_id: string;
    legal_name: string;
    country_code: string;
  } | null>(null);
  const [supabaseCompanyName, setSupabaseCompanyName] = useState<string | null>(null);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

  const waitTx = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  function fmtErr(e: unknown): string {
    if (e instanceof Error) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }

  const contracts = useMemo(() => {
    try {
      return getContracts(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  const me = address as Address | undefined;
  const onTargetChain = chainId === targetPayrollChain.id;
  const registry = contracts?.PayrailFactoryRegistry;

  const myCompany = useReadContract(
    registry && me
      ? {
          address: registry.address,
          abi: registry.abi,
          functionName: "myCompany",
          account: me,
        }
      : undefined
  );

  const payrollAddr = (myCompany.data as Address | undefined) ?? ZERO;
  const hasOnchainCompany = payrollAddr !== ZERO;
  const isSupabaseSynced = !!supabaseCompanyName;
  const needsSupabaseSync = hasOnchainCompany && !isSupabaseSynced;

  const draftStorageKey = useMemo(() => {
    if (!me) return null;
    return `pendingCompanyDraft:${chainId}:${me.toLowerCase()}`;
  }, [me, chainId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!me) {
        if (!cancelled) {
          setSupabaseCompanyName(null);
          setSupabaseSyncError(null);
        }
        return;
      }

      try {
        const binding = await getEmployerCompanyBinding({
          employerWalletAddress: me,
          chainId,
        });

        if (!cancelled) {
          setSupabaseCompanyName(binding?.company?.legal_name ?? null);
        }
      } catch (e) {
        if (!cancelled) setStatus(fmtErr(e));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [me, chainId]);

  useEffect(() => {
    if (!waitTx.isSuccess) return;

    (async () => {
      try {
        setStatus("✅ On-chain confirmed. Syncing backend...");
        const refetchResult = await myCompany.refetch?.();
        const freshPayrollAddr = refetchResult?.data as Address | undefined;
        await syncSupabaseFromInputsOrDraft(freshPayrollAddr);
        setTxHash(null);
      } catch (e) {
        setStatus(`❌ On-chain confirmed, but backend sync failed: ${fmtErr(e)}`);
        setTxHash(null);
      }
    })();
  }, [waitTx.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  async function syncSupabaseFromInputsOrDraft(freshPayrollAddr?: Address) {
    if (!me) throw new Error("Connect wallet");
    if (!draftStorageKey) throw new Error("Missing storage key");

    const effectivePayrollAddr = freshPayrollAddr ?? payrollAddr;
    if (!effectivePayrollAddr || effectivePayrollAddr === ZERO) throw new Error("No on-chain payroll found");

    setSyncingSupabase(true);
    setSupabaseSyncError(null);

    try {
      let draft = pendingCompanyDraft;

      if (!draft) {
        const raw = localStorage.getItem(draftStorageKey);
        if (raw) {
          try {
            draft = JSON.parse(raw);
          } catch {}
        }
      }

      if (!draft) {
        if (!companyName.trim()) throw new Error("Company name is required to complete backend sync");
        if (!countryCode.trim()) throw new Error("Country code is required to complete backend sync");

        draft = {
          company_id: crypto.randomUUID(),
          legal_name: companyName.trim(),
          country_code: countryCode.trim().toUpperCase(),
        };
      }

      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setPendingCompanyDraft(draft);

      await upsertCompanyRegistration({
        ...draft,
        chain_id: chainId,
        employer_wallet_address: me,
        payroll_contract_address: effectivePayrollAddr,
      });

      setSupabaseCompanyName(draft.legal_name);
      setStatus("✅ Backend sync completed");
      localStorage.removeItem(draftStorageKey);
      setPendingCompanyDraft(null);
    } catch (e) {
      const msg = fmtErr(e);
      setSupabaseSyncError(msg);
      setStatus(`❌ Supabase sync failed: ${msg}`);
    } finally {
      setSyncingSupabase(false);
    }
  }

  useEffect(() => {
    if (!needsSupabaseSync || !draftStorageKey) return;
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return;
    syncSupabaseFromInputsOrDraft().catch(() => {});
  }, [needsSupabaseSync, draftStorageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function registerCompany() {
    if (!registry || !me) throw new Error(dict?.status.connectWalletFirst || "Connect wallet first");
    if (!onTargetChain) {
      throw new Error(dict?.status.pleaseSwitchToTargetChain || `Please switch to ${TARGET_PAYROLL_CHAIN_NAME}`);
    }

    const freshResult = await myCompany.refetch?.();
    const freshPayrollAddr = freshResult?.data as Address | undefined;
    const alreadyOnchain = !!freshPayrollAddr && freshPayrollAddr !== ZERO;

    if (alreadyOnchain) {
      if (isSupabaseSynced) {
        setStatus("✅ Your company is already fully registered. Go to the Employer Dashboard to manage it.");
        return;
      }
      setStatus("On-chain payroll found. Completing backend sync...");
      await syncSupabaseFromInputsOrDraft(freshPayrollAddr);
      return;
    }

    if (!companyName.trim()) throw new Error(dict?.status.companyNameRequired || "Company name is required");
    if (!countryCode.trim()) throw new Error("Country code is required");

    const draft = {
      company_id: crypto.randomUUID(),
      legal_name: companyName.trim(),
      country_code: countryCode.trim().toUpperCase(),
    };

    const companyRef = keccak256(stringToHex(draft.company_id));
    setPendingCompanyDraft(draft);

    if (draftStorageKey) {
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    }

    setStatus("Registering company on-chain...");
    try {
      const hash = await writeContractAsync({
        chainId,
        account: me,
        address: registry.address,
        abi: registry.abi,
        functionName: "registerCompany",
        args: [companyRef],
      });

      setTxHash(hash);
      setStatus(dict?.status.transactionSubmitted || "Transaction submitted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("CompanyAlreadyRegistered")) {
        setStatus("✅ Your company is already registered on-chain. Refreshing state…");
        await myCompany.refetch?.();
      } else {
        throw e;
      }
    }
  }

  return (
    <>
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[1280px]">
          <section className="overflow-hidden rounded-[28px] border border-border/70 bg-card dark:bg-[rgba(16,22,30,0.9)]">
            <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="section-label">Employer onboarding</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{dict.employerOnboarding.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {dict.employerOnboarding.description}
                </p>
              </div>
              <Badge
                variant="outline"
                className={hasOnchainCompany ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200"}
              >
                {hasOnchainCompany ? dict.employerOnboarding.registered : dict.employerOnboarding.unregistered}
              </Badge>
            </div>

            <div className="space-y-6 px-6 py-6">
              {!hasOnchainCompany ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="section-label" htmlFor="companyName">
                        {dict.employerOnboarding.companyNameLabel}
                      </label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={dict.employerOnboarding.companyNamePlaceholder}
                      />
                      <p className="text-xs text-muted-foreground">
                        <Lock className="mr-1 inline h-3 w-3" />
                        {dict.employerOnboarding.companyNameNote}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="section-label" htmlFor="countryCode">
                        Country code (ISO-2)
                      </label>
                      <Input
                        id="countryCode"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        placeholder="ES"
                        maxLength={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for institutional jurisdiction and backend registration.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-5">
                    <Button
                      onClick={() => registerCompany().catch((e) => setStatus(fmtErr(e)))}
                      disabled={!onTargetChain || waitTx.isLoading}
                      size="lg"
                    >
                      {dict.common.registerCompany}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {!onTargetChain && (
                      <Badge variant="destructive" className="rounded-full px-3 py-1">
                        {dict.employerOnboarding.switchToTargetChain}
                      </Badge>
                    )}
                  </div>
                </>
              ) : !isSupabaseSynced ? (
                <>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100">
                    On-chain payroll found, but backend setup is incomplete. Complete the company profile to finish onboarding.
                  </div>

                  <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                      <div className="section-label">{dict.employerOnboarding.payrollContract}</div>
                      <code className="mt-2 block break-all font-mono text-xs text-muted-foreground">{payrollAddr}</code>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="section-label" htmlFor="companyName">
                          {dict.employerOnboarding.companyNameLabel}
                        </label>
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="section-label" htmlFor="countryCode">
                          Country code (ISO-2)
                        </label>
                        <Input id="countryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} maxLength={2} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-5">
                    <Button
                      onClick={() => syncSupabaseFromInputsOrDraft().catch((e) => setStatus(fmtErr(e)))}
                      disabled={syncingSupabase}
                      size="lg"
                    >
                      {syncingSupabase ? "Syncing..." : "Complete setup"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {supabaseSyncError && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-950 dark:text-red-100">
                        Supabase error: {supabaseSyncError}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">{dict.employerOnboarding.companyAlreadyRegistered}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                      <div className="section-label">{dict.employerOnboarding.payrollContract}</div>
                      <code className="mt-2 block break-all font-mono text-xs text-muted-foreground">{payrollAddr}</code>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                      <div className="section-label">{dict.employerOnboarding.companyName}</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight">{supabaseCompanyName ?? dict.common.loading}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-border/70 pt-5">
                    <Link href={`/${locale}/employer`}>
                      <Button>{dict.common.goToEmployerDashboard}</Button>
                    </Link>
                    <Link href={`/${locale}/employee`}>
                      <Button variant="outline">{dict.common.employeePortal}</Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {dict.employerOnboarding.registryCheckActive}
                </div>
                {waitTx.isLoading && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {dict.employerOnboarding.loadingState}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      {status ? (() => {
        const isSuccess = status.startsWith("✅") || status.includes("successfully");
        const isError = status.startsWith("❌");
        return (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <Card className={`border ${isSuccess ? "border-green-500/50" : isError ? "border-destructive/50" : "border-border/70"}`}>
              <CardContent className="flex items-start gap-3 p-4">
                {isSuccess ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : isError ? (
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                  </svg>
                ) : (
                  <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="break-words text-sm text-foreground">{status}</span>
                  {(isSuccess || isError) ? (
                    <button
                      onClick={() => setStatus("")}
                      className="mt-2 block text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Dismiss
                    </button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })() : null}
    </>
  );
}
