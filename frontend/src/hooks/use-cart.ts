"use client";

import { useSyncExternalStore } from "react";
import { isCartDrawerOpen, subscribeToCartDrawer } from "@/lib/cart/drawer";
import { getCartLines, getCartSubtotal, subscribeToCart } from "@/lib/cart/store";
import type { CartLine } from "@/types/cart";

/** Cart lines, or null on the server and before hydration so UI can show a placeholder. */
export function useCartLines(): CartLine[] | null {
  return useSyncExternalStore(subscribeToCart, getCartLines, () => null);
}

/** Total item quantity for the header badge. 0 until the cart has hydrated. */
export function useCartCount(): number {
  const lines = useCartLines();
  return lines ? lines.reduce((sum, line) => sum + line.quantity, 0) : 0;
}

export function useCartSubtotal(): number {
  const lines = useCartLines();
  return lines ? getCartSubtotal(lines) : 0;
}

export function useCartDrawerOpen(): boolean {
  return useSyncExternalStore(subscribeToCartDrawer, isCartDrawerOpen, () => false);
}
