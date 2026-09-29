"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import { maxQuantityFor, removeFromCart, setCartQuantity } from "@/lib/cart/store";
import type { CartLine } from "@/types/cart";
import { QuantityStepper } from "./quantity-stepper";

type CartLineItemProps = {
  line: CartLine;
  /** Called when the shopper follows a link out of the cart, e.g. to close the drawer. */
  onNavigate?: () => void;
};

export function CartLineItem({ line, onNavigate }: CartLineItemProps) {
  const max = maxQuantityFor(line);
  const href = `/product/${line.slug}`;

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={href}
        onClick={onNavigate}
        className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md bg-cream-200 sm:w-24"
      >
        {line.image && <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className="text-sm font-medium leading-snug text-navy-800 hover:underline sm:text-base"
            >
              {line.name}
            </Link>
            <p className="mt-1 text-xs text-navy-500 sm:text-sm">
              Size {line.size} · {line.color}
            </p>
          </div>
          <Price amount={line.unitPricePaise * line.quantity} className="shrink-0 text-sm sm:text-base" />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantityStepper
            value={line.quantity}
            max={max}
            label={line.name}
            onChange={(quantity) => setCartQuantity(line.variantId, quantity)}
          />
          <button
            type="button"
            onClick={() => removeFromCart(line.variantId)}
            aria-label={`Remove ${line.name}, size ${line.size}, ${line.color}`}
            className="text-sm text-navy-500 underline underline-offset-4 hover:text-navy-800"
          >
            Remove
          </button>
        </div>
        {line.quantity >= max && (
          <p className="mt-2 text-xs text-navy-400">
            {max === line.stock ? "Maximum available" : `Limit of ${max} per order`}
          </p>
        )}
      </div>
    </li>
  );
}
