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

/** Expected delivery time after an order is placed, in business days (Mon to Fri). */
export const deliveryWindow = {
  minBusinessDays: 4,
  maxBusinessDays: 7,
} as const;

function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

/** Human-readable delivery window such as "Mon 6 Oct to Thu 9 Oct". */
export function formatDeliveryWindow(orderedAt: Date): string {
  const format = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  const earliest = addBusinessDays(orderedAt, deliveryWindow.minBusinessDays);
  const latest = addBusinessDays(orderedAt, deliveryWindow.maxBusinessDays);
  return `${format.format(earliest)} to ${format.format(latest)}`;
}
