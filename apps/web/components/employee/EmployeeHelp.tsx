"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeePageShell } from "@/components/employee/EmployeePageShell";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

interface EmployeeHelpProps {
  locale: Locale;
  status: string;
}

export function EmployeeHelp({ locale, status }: EmployeeHelpProps) {
  const dict = useDictionary(locale);

  if (!dict) return null;

  const t = dict.employeePage;
  const tSidebar = dict.employeeSidebar as any;

  const topics = [
    {
      title: tSidebar.gettingStarted,
      description: tSidebar.gettingStartedDesc,
      items: [tSidebar.connectWallet, tSidebar.selectCompany, tSidebar.decryptSalary, tSidebar.viewBalance],
    },
    {
      title: tSidebar.securityPrivacy,
      description: tSidebar.securityPrivacyDesc,
      items: [tSidebar.endToEndEncryption, tSidebar.privateKeyControl, tSidebar.zeroKnowledgeProofs, tSidebar.onchainConfidentiality],
    },
    {
      title: tSidebar.troubleshooting,
      description: tSidebar.troubleshootingDesc,
      items: [tSidebar.connectionProblems, tSidebar.decryptionFailures, tSidebar.balanceNotShowing, tSidebar.walletIssues],
    },
  ];

  const faqs = [
    { q: tSidebar.faqDecryptSalary, a: tSidebar.faqDecryptSalaryAns },
    { q: tSidebar.faqFhe, a: tSidebar.faqFheAns },
    { q: tSidebar.faqSecurity, a: tSidebar.faqSecurityAns },
    { q: tSidebar.faqEmployerSee, a: tSidebar.faqEmployerSeeAns },
  ];

  return (
    <EmployeePageShell
      locale={locale}
      currentPath={`/${locale}/employee/help`}
      title={tSidebar.help}
      subtitle={t.securedByFhe}
      status={status}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.title} className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
            <CardHeader>
              <div className="section-label">Guidance</div>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">{topic.title}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{topic.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {topic.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/40 bg-white/74 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
          <CardHeader>
            <div className="section-label">{tSidebar.faqTitle}</div>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight">Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-[24px] border border-white/30 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="font-medium text-foreground">{faq.q}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-900/5 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9))] text-white dark:border-white/10">
            <CardHeader>
              <div className="section-label text-slate-400">Support channels</div>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-tight text-white">{tSidebar.quickLinks}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>Use documentation for workflow guidance, support for access issues, and API references for technical integration.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Link href={`/${locale}/employee/salary`}>
              <Card className="border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Return</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Salary</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Go back to salary visibility and decryption controls.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/${locale}/employee/settings`}>
              <Card className="border-white/40 bg-white/72 transition-colors hover:border-sky-500/30 dark:border-white/10 dark:bg-[rgba(7,18,36,0.76)]">
                <CardContent className="p-5">
                  <div className="section-label">Configuration</div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">Settings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Review network posture and employee preferences.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </EmployeePageShell>
  );
}
