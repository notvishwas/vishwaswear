import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "gold" | "navy" | "outline";

const variants: Record<BadgeVariant, string> = {
  gold: "bg-gold-50 text-gold-700 border-gold-300",
  navy: "bg-navy-800 text-white border-navy-800",
  outline: "bg-transparent text-navy-600 border-navy-200",
};

type BadgeProps = ComponentProps<"span"> & { variant?: BadgeVariant };

export function Badge({ variant = "gold", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
