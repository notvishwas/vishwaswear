import type { ComponentProps } from "react";
import { cn, formatPrice } from "@/lib/utils";

type PriceProps = Omit<ComponentProps<"span">, "children"> & {
  /** Amount in paise. */
  amount: number;
  /** Original amount in paise, shown struck through when higher than `amount`. */
  compareAt?: number;
};

export function Price({ amount, compareAt, className, ...props }: PriceProps) {
  const onSale = compareAt !== undefined && compareAt > amount;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)} {...props}>
      <span className="font-semibold">{formatPrice(amount)}</span>
      {onSale && (
        <s className="text-sm font-normal text-navy-300">{formatPrice(compareAt)}</s>
      )}
    </span>
  );
}
