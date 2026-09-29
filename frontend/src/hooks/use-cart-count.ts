"use client";

import { useSyncExternalStore } from "react";
import { getCartCount, subscribeToCart } from "@/lib/cart/store";

/** Live item count for the cart badge. Renders 0 on the server and before hydration. */
export function useCartCount() {
  return useSyncExternalStore(subscribeToCart, getCartCount, () => 0);
}
