import type { ReactNode } from "react";
import { Price } from "@/components/ui/price";
import { amountToFreeShipping, calculateShipping } from "@/config/shipping";
import { formatPrice } from "@/lib/utils";

type CartSummaryProps = {
  subtotalPaise: number;
  children?: ReactNode;
};

export function CartSummary({ subtotalPaise, children }: CartSummaryProps) {
  const shipping = calculateShipping(subtotalPaise);
  const remaining = amountToFreeShipping(subtotalPaise);

  return (
    <div>
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-navy-500">Subtotal</dt>
          <dd className="font-medium text-navy-800">
            <Price amount={subtotalPaise} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-navy-500">Estimated shipping</dt>
          <dd className="font-medium text-navy-800">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-cream-300 pt-3 text-base">
          <dt className="font-semibold text-navy-800">Estimated total</dt>
          <dd className="font-semibold text-navy-800">
            <Price amount={subtotalPaise + shipping} />
          </dd>
        </div>
      </dl>
      {remaining > 0 && (
        <p className="mt-3 rounded-md bg-gold-50 px-3 py-2 text-xs text-gold-700">
          Add {formatPrice(remaining)} more for free shipping.
        </p>
      )}
      <p className="mt-3 text-xs text-navy-400">Final shipping and total are confirmed at checkout.</p>
      {children && <div className="mt-5 flex flex-col gap-3">{children}</div>}
    </div>
  );
}
