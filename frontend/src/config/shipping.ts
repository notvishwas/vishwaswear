/** Shipping rules. All amounts are integer paise. Change the numbers here and everything follows. */
export const shippingConfig = {
  /** Orders with a subtotal above this ship free (₹2,999). */
  freeShippingThresholdPaise: 299_900,
  /** Flat fee for orders at or below the threshold (₹149). */
  flatFeePaise: 14_900,
} as const;

export function calculateShipping(subtotalPaise: number): number {
  if (subtotalPaise <= 0) return 0;
  return subtotalPaise > shippingConfig.freeShippingThresholdPaise ? 0 : shippingConfig.flatFeePaise;
}

/** Paise still needed to unlock free shipping; 0 once it applies or the cart is empty. */
export function amountToFreeShipping(subtotalPaise: number): number {
  if (subtotalPaise <= 0) return 0;
  return Math.max(0, shippingConfig.freeShippingThresholdPaise + 1 - subtotalPaise);
}
