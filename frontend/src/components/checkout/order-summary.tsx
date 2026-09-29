"use client";

import Image from "next/image";
import { useState } from "react";
import { CartSummary } from "@/components/cart/cart-summary";
import { Price } from "@/components/ui/price";
import { calculateShipping } from "@/config/shipping";
import { cn, formatPrice } from "@/lib/utils";
import type { CartLine } from "@/types/cart";

type OrderSummaryProps = {
  lines: CartLine[];
  subtotalPaise: number;
};

/** Collapsible on mobile (closed by default, with the total visible), always open on desktop. */
export function OrderSummary({ lines, subtotalPaise }: OrderSummaryProps) {
  const [open, setOpen] = useState(false);
  const total = subtotalPaise + calculateShipping(subtotalPaise);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <section aria-label="Order summary" className="rounded-md border border-cream-300 bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="order-summary-body"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left lg:hidden"
      >
        <span className="text-sm font-semibold text-navy-800">
          {open ? "Hide" : "Show"} order summary ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="text-sm font-semibold text-navy-800">{formatPrice(total)}</span>
      </button>

      <h2 className="hidden px-5 pt-5 text-base font-semibold text-navy-800 lg:block">Order summary</h2>

      <div id="order-summary-body" className={cn("px-4 pb-5 lg:block lg:px-5", open ? "block" : "hidden")}>
        <ul className="divide-y divide-cream-300">
          {lines.map((line) => (
            <li key={line.variantId} className="flex gap-3 py-4">
              <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-sm bg-cream-200">
                {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />}
                <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-bl-sm bg-navy-800 text-[0.6875rem] font-semibold text-white">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-navy-800">{line.name}</p>
                <p className="mt-0.5 text-xs text-navy-500">
                  Size {line.size} · {line.color}
                </p>
              </div>
              <Price amount={line.unitPricePaise * line.quantity} className="shrink-0 text-sm" />
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-cream-300 pt-4">
          <CartSummary subtotalPaise={subtotalPaise} />
        </div>
      </div>
    </section>
  );
}
