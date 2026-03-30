import "./globals.css";
import type { Metadata } from "next";
import { i18n } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Payrail - Compliant, Auditable, Encrypted Payroll Rail for Institutions",
  description: "Compliant, auditable, encrypted payroll rail for institutions",
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  await params;

  return <div className="font-sans antialiased">{children}</div>;
}
