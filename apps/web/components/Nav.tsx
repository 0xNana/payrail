"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { i18n } from "@/i18n-config";

export function Nav() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = i18n.locales.includes(segments[1] as (typeof i18n.locales)[number])
    ? segments[1]
    : i18n.defaultLocale;
  const homeHref = `/${locale}`;
  const employerHref = `/${locale}/employer/dashboard`;
  const employeeHref = `/${locale}/employee/salary`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href={homeHref}>
            <Button
              variant={pathname === homeHref ? "default" : "ghost"}
              size="sm"
            >
              Home
            </Button>
          </Link>
          <Link href={employerHref}>
            <Button
              variant={pathname.startsWith(`/${locale}/employer`) ? "default" : "ghost"}
              size="sm"
            >
              Employer
            </Button>
          </Link>
          <Link href={employeeHref}>
            <Button
              variant={pathname.startsWith(`/${locale}/employee`) ? "default" : "ghost"}
              size="sm"
            >
              Employee
            </Button>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
