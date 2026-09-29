import { z } from "zod";

const STORAGE_KEY = "cart:v1";

const cartLinesSchema = z.array(
  z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().positive(),
  }),
);

export type CartLine = z.infer<typeof cartLinesSchema>[number];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function readCartLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = cartLinesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writeCartLines(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode, quota); the cart just won't persist.
  }
  emit();
}

/** Total number of items across all lines. A primitive, so it is a stable snapshot. */
export function getCartCount(): number {
  return readCartLines().reduce((sum, line) => sum + line.quantity, 0);
}

export function subscribeToCart(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
