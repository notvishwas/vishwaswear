import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "text-lg font-extrabold uppercase tracking-[0.22em] text-navy-800 sm:text-xl",
        className,
      )}
    >
      {siteConfig.name}
    </Link>
  );
}
