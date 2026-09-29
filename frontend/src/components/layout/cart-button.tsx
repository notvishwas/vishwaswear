"use client";

import Link from "next/link";
import { useCartCount } from "@/hooks/use-cart-count";
import { BagIcon } from "./icons";

export function CartButton() {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="relative inline-flex size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5"
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex min-w-[1.125rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6875rem] font-bold leading-[1.125rem] text-navy-900"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
