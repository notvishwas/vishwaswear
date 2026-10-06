import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** Small line under the value, e.g. what the number counts. */
  hint?: string;
  /** Highlights the card, for numbers that need attention such as low stock. */
  tone?: "default" | "warning";
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border bg-white p-4 sm:p-5",
        tone === "warning" ? "border-gold-500" : "border-cream-300",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-navy-800 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}
