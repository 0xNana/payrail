"use client";

import dynamic from "next/dynamic";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then((m) => m.ThemeToggle), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-full border border-white/20" />,
});

const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher").then((m) => m.LanguageSwitcher), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-full border border-white/20" />,
});

const Connect = dynamic(() => import("@/components/Connect").then((m) => m.Connect), {
  ssr: false,
  loading: () => <div className="h-10 w-32 rounded-full border border-white/20" />,
});

export function HomePageHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LanguageSwitcher />
      <Connect />
    </div>
  );
}
