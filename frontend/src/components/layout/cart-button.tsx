"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartCount } from "@/hooks/use-cart";
import { openCartDrawer } from "@/lib/cart/drawer";
import { BagIcon } from "./icons";

export function CartButton() {
  const count = useCartCount();
  const pathname = usePathname();

  return (
    <Link
      href="/cart"
      onClick={(event) => {
        // Open the drawer, except on the cart page itself or when opening in a new tab.
        if (pathname === "/cart" || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        openCartDrawer();
      }}
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
