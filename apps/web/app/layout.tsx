import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payrail - Compliant, Auditable, Encrypted Payroll Rail for Institutions",
  description: "Compliant, auditable, encrypted payroll rail for institutions",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/payrail-mark.svg" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
