import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "text-base font-extrabold uppercase tracking-[0.18em] text-navy-800 sm:text-xl sm:tracking-[0.22em]",
        className,
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
