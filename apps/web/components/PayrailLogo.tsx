import Image from "next/image";
import { cn } from "@/lib/utils";

type PayrailLogoProps = {
  variant?: "mark" | "wordmark" | "lockup";
  className?: string;
};

export function PayrailLogo({ variant = "lockup", className }: PayrailLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/payrail-mark.svg"
        alt="Payrail"
        width={40}
        height={40}
        className={cn("h-10 w-10", className)}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <Image
        src="/payrail-logo.svg"
        alt="Payrail"
        width={164}
        height={32}
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image src="/payrail-mark.svg" alt="Payrail" width={40} height={40} className="h-10 w-10" />
      <Image src="/payrail-logo.svg" alt="Payrail wordmark" width={144} height={28} className="h-7 w-auto" />
    </div>
  );
}
