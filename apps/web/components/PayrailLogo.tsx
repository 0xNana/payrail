"use client";

import { cn } from "@/lib/utils";

type PayrailLogoProps = {
  variant?: "mark" | "wordmark" | "lockup";
  className?: string;
};

export function PayrailLogo({ variant = "lockup", className }: PayrailLogoProps) {
  if (variant === "mark") {
    return (
      <img
        src="/payrail-mark.svg"
        alt="Payrail"
        className={cn("h-10 w-10", className)}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <img
        src="/payrail-logo.svg"
        alt="Payrail"
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img src="/payrail-mark.svg" alt="Payrail" className="h-10 w-10" />
      <img src="/payrail-logo.svg" alt="Payrail wordmark" className="h-7 w-auto" />
    </div>
  );
}
