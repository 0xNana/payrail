"use client";

import { useMemo, useState } from "react";
import { isAddress, parseUnits, type Abi, type Address } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { encryptUint64 } from "@/lib/fhe";
import { registerEmployee } from "@/lib/supabasePayroll";
import type { PayrollCadence } from "@/lib/supabasePayroll";
import type { Dictionary } from "@/lib/useDictionary";
import { targetPayrollChain } from "@/lib/targetChain";

type DniTypeKey = "DNI" | "NIE" | "NIF" | "PASSPORT";

const DNI_TYPE_KEYS: DniTypeKey[] = ["DNI", "NIE", "NIF", "PASSPORT"];
const CADENCE_KEYS: PayrollCadence[] = ["monthly", "semiMonthly", "weekly"];

type Props = {
  payrollAddr: Address;
  payrollAbi: Abi;
  companyOnchainBindingId: string;
  underlyingDecimals: number;
  underlyingSymbol: string;
  onSuccess: () => void;
  t: Dictionary["registerEmployeeForm"];
};

export function RegisterEmployeeForm({
  payrollAddr,
  payrollAbi,
  companyOnchainBindingId,
  underlyingDecimals,
  underlyingSymbol,
  onSuccess,
  t,
}: Props) {
  const { address: me } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [dniType, setDniType] = useState<DniTypeKey>("DNI");
  const [dniValue, setDniValue] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  });
  const [walletAddress, setWalletAddress] = useState("");
  const [salaryInput, setSalaryInput] = useState("1000");
  const [payrollCadence, setPayrollCadence] = useState<PayrollCadence>("monthly");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const canUseFhe = chainId === targetPayrollChain.id;

  const salaryBaseUnits = useMemo(() => {
    try {
      return parseUnits(salaryInput || "0", underlyingDecimals);
    } catch {
      return null;
    }
  }, [salaryInput, underlyingDecimals]);

  const isSuccess = status.startsWith("✅");
  const isError = status.startsWith("❌");

  function getErrorName(e: unknown): string | undefined {
    const anyE = e as any;
    return anyE?.cause?.data?.errorName ?? anyE?.data?.errorName ?? anyE?.cause?.name ?? anyE?.name;
  }

  async function handleRegister() {
    if (!me) return setStatus(`❌ ${t.errors.connectWallet}`);
    if (!isAddress(walletAddress)) return setStatus(`❌ ${t.errors.invalidAddress}`);
    if (!givenName.trim() || !familyName.trim()) return setStatus(`❌ ${t.errors.nameRequired}`);
    if (!dniValue.trim()) return setStatus(`❌ ${t.errors.idRequired}`);
    if (!salaryBaseUnits || salaryBaseUnits <= 0n) return setStatus(`❌ ${t.errors.invalidSalary}`);
    if (!canUseFhe) return setStatus(`❌ ${t.errors.switchToTargetChain}`);
    if (!publicClient) return setStatus("❌ Public client not ready");
    if (!walletClient) return setStatus("❌ Wallet client not ready");

    const employee = walletAddress as Address;

    setLoading(true);
    setStatus("");

    try {
      setStatus(`⛓️ ${t.statusMessages.addingOnChain}`);

      const alreadyActive = (await publicClient.readContract({
        address: payrollAddr,
        abi: payrollAbi,
        functionName: "isEmployee",
        args: [employee],
      }).catch(() => false)) as boolean;

      if (!alreadyActive) {
        const addHash = await writeContractAsync({
          address: payrollAddr,
          abi: payrollAbi,
          functionName: "addEmployee",
          args: [employee],
          chainId,
          account: me,
        });
        await publicClient.waitForTransactionReceipt({ hash: addHash });
      }

      setStatus(`🔐 ${t.statusMessages.encryptingSalary}`);

      const UINT64_MAX = (1n << 64n) - 1n;
      if (salaryBaseUnits > UINT64_MAX) {
        setLoading(false);
        return setStatus(`❌ ${t.errors.salaryTooLarge}`);
      }

      const encryptedSalary = await encryptUint64({
        chainId,
        publicClient,
        walletClient,
        userAddress: me,
        value: salaryBaseUnits,
      });

      setStatus(`⛓️ ${t.statusMessages.settingSalary}`);

      const salaryHash = await writeContractAsync({
        address: payrollAddr,
        abi: payrollAbi,
        functionName: "setSalary",
        args: [employee, encryptedSalary],
        chainId,
        account: me,
      });
      await publicClient.waitForTransactionReceipt({ hash: salaryHash });

      setStatus(`💾 ${t.statusMessages.savingToDatabase}`);

      await registerEmployee(
        {
          company_onchain_binding_id: companyOnchainBindingId,
          chain_id: chainId,
          wallet_address: employee,
          given_name: givenName.trim(),
          family_name: familyName.trim(),
          dni_type: dniType,
          dni_value: dniValue.trim(),
          email: email.trim() || undefined,
          job_title: jobTitle.trim() || undefined,
          start_date: startDate,
          payroll_cadence: payrollCadence,
        },
        me
      );

      setStatus(`✅ ${t.statusMessages.success}: ${salaryHash}`);
      setGivenName("");
      setFamilyName("");
      setDniValue("");
      setEmail("");
      setJobTitle("");
      setWalletAddress("");
      setSalaryInput("1000");
      setPayrollCadence("monthly");
      onSuccess();
    } catch (e) {
      const name = getErrorName(e);
      if (name === "UserRejectedRequestError") {
        setStatus("❌ Transaction rejected in wallet. Nothing was saved to the database.");
      } else {
        setStatus(`❌ ${e instanceof Error ? e.message : String(e)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/70 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-label">Employee onboarding</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add the employee on-chain, encrypt the salary locally, then commit the company record to Supabase.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {underlyingSymbol} · {underlyingDecimals} decimals
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleRegister();
          }}
          className="space-y-6 rounded-2xl border border-border/70 bg-card p-5 dark:bg-[rgba(16,22,30,0.9)]"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="section-label">Identity</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.givenName}</p>
                  <Input value={givenName} onChange={(e) => setGivenName(e.target.value)} placeholder={t.givenNamePlaceholder} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.familyName}</p>
                  <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder={t.familyNamePlaceholder} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.idType}</p>
                  <select
                    value={dniType}
                    onChange={(e) => setDniType(e.target.value as DniTypeKey)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                  >
                    {DNI_TYPE_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {t.dniTypes[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.idValue}</p>
                  <Input value={dniValue} onChange={(e) => setDniValue(e.target.value)} placeholder={t.idValuePlaceholder} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.email}</p>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.jobTitle}</p>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={t.jobTitlePlaceholder} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="section-label">Payroll configuration</div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {t.walletAddress} <span className="normal-case text-muted-foreground/60">— {t.walletAddressNote}</span>
                </p>
                <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="Employee wallet address" className="font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.startDate}</p>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.salaryLabels[payrollCadence]} ({underlyingSymbol})</p>
                  <Input value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} placeholder={`Salary amount in ${underlyingSymbol}`} inputMode="decimal" />
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.cadenceLabel}</p>
                <select
                  value={payrollCadence}
                  onChange={(e) => setPayrollCadence(e.target.value as PayrollCadence)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                >
                  {CADENCE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t.cadenceOptions[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                The employee record is only persisted after the on-chain employee addition and encrypted salary write both succeed.
              </div>
            </div>
          </div>

          {salaryBaseUnits !== null && (
            <p className="font-mono text-[11px] text-muted-foreground">
              {t.internalUnits}: {salaryBaseUnits.toString()} {t.baseUnits} — {salaryInput} {underlyingSymbol}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/70 pt-4">
            <div className="text-sm text-muted-foreground">{loading ? t.registeringButton : t.registerButton}</div>
            <Button type="submit" disabled={loading} className="px-5">
              {loading ? t.registeringButton : t.registerButton}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card p-5 dark:bg-[rgba(16,22,30,0.9)]">
            <div className="section-label">Execution path</div>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Verify the employee wallet on the active chain.</li>
              <li>2. Add the employee to the payroll contract.</li>
              <li>3. Encrypt and set the salary on-chain.</li>
              <li>4. Save identity and employment records off-chain.</li>
            </ol>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-sky-500/15 bg-sky-500/10 px-4 py-3">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t.privacyNote}</p>
          </div>

          {status && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${
              isSuccess
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                : isError
                  ? "border-red-500/20 bg-red-500/10 text-red-950 dark:text-red-100"
                  : "border-sky-500/20 bg-sky-500/10 text-sky-950 dark:text-sky-100"
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
