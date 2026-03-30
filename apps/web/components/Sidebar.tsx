"use client";

import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n-config";
import { useDictionary } from "@/lib/useDictionary";

const sidebarVariants = cva(
  "fixed left-0 top-0 z-50 h-full w-72 border-r border-white/6 bg-[linear-gradient(180deg,rgba(12,17,24,0.99),rgba(15,21,29,0.98))] text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-300 ease-out",
  {
    variants: {
      side: {
        left: "translate-x-0",
        right: "translate-x-full",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
);

interface SidebarProps {
  locale: Locale;
  variant: "employee" | "employer";
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar({ locale, variant, isOpen, onClose, currentPath }: SidebarProps) {
  const navItems: NavItem[] = variant === "employee"
    ? [
        {
          label: "mySalary",
          href: `/${locale}/employee/salary`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: "myBalance",
          href: `/${locale}/employee/balance`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          ),
        },
        {
          label: "settings",
          href: `/${locale}/employee/settings`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          label: "help",
          href: `/${locale}/employee/help`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ]
    : [
        {
          label: "dashboard",
          href: `/${locale}/employer/dashboard`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          label: "funding",
          href: `/${locale}/employer/funding`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V7m0 1v8m0 0v1" />
            </svg>
          ),
        },
        {
          label: "treasury",
          href: `/${locale}/employer/treasury`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4.5v5.5c0 5-3.07 8.66-7 10-3.93-1.34-7-5-7-10V6.5L12 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11h2v2h-2z" />
            </svg>
          ),
        },
        {
          label: "roster",
          href: `/${locale}/employer/roster`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          label: "registerEmployee",
          href: `/${locale}/employer/register`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
        },
        {
          label: "operator",
          href: `/${locale}/employer/operator`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1l3 6h6v11a3 3 0 01-3 3H6a3 3 0 01-3-3V7h6l3-6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13l2 2 4-4" />
            </svg>
          ),
        },
        {
          label: "confidential",
          href: `/${locale}/employer/confidential`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c-1.1 0-2 .9-2 2v4h4v-4c0-1.1-.9-2-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8V7a6 6 0 1112 0v1" />
              <rect x="4" y="10" width="16" height="10" rx="2" />
            </svg>
          ),
        },
        {
          label: "settings",
          href: `/${locale}/employer/settings`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ];

  const dict = useDictionary(locale);

  if (!dict) {
    return null;
  }

  const t = variant === "employee" ? dict.employeeSidebar : dict.employerSidebar;

  const getLabel = (key: string) => {
    return (t as any)?.[key] || key;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[rgba(4,8,14,0.62)] backdrop-blur-md"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(sidebarVariants({ side: "left" }), !isOpen && "-translate-x-full")}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="section-label text-white/55">
                  {variant === "employer" ? "Employer command center" : "Employee workspace"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">{getLabel("navigation")}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {variant === "employer"
                      ? "Encrypted payroll operations, treasury control, and audit workflows."
                      : "Private salary access, balance visibility, and secure account controls."}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              const itemIndex = navItems.indexOf(item) + 1;
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.href;
                    onClose();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-[22px] px-4 py-3.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[linear-gradient(180deg,rgba(230,236,242,0.98),rgba(211,220,230,0.98))] text-slate-950 shadow-[0_14px_40px_rgba(0,0,0,0.28)]"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                      isActive
                        ? "border-slate-300/80 bg-slate-100 text-slate-900"
                        : "border-white/8 bg-white/[0.03] text-slate-300 group-hover:border-white/14 group-hover:bg-white/[0.07] group-hover:text-white"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{getLabel(item.label)}</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.24em]",
                      isActive ? "text-slate-500" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  >
                    {itemIndex.toString().padStart(2, "0")}
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="section-label text-white/55">Network posture</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Arbitrum Sepolia</p>
                  <p className="mt-1 text-xs text-slate-400">{dict.common.poweredByPayrailFhe}</p>
                </div>
                <div className="metric-chip border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Live
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
