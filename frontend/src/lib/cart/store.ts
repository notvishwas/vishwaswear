import { MAX_QUANTITY_PER_LINE } from "@/lib/shop/variants";
import type { CartLine, ValidatedCart } from "@/types/cart";

// Bump the version when the stored shape changes; older carts are then ignored.
const STORAGE_KEY = "cart:v2";

const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Checks stored data by hand instead of with zod, which keeps a large library out of every page. */
function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    isText(line.variantId) &&
    isText(line.productId) &&
    isText(line.slug) &&
    isText(line.name) &&
    isText(line.size) &&
    isText(line.color) &&
    (line.image === null || typeof line.image === "string") &&
    isCount(line.unitPricePaise) &&
    isCount(line.quantity) &&
    line.quantity > 0 &&
    isCount(line.stock)
  );
}

const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore needs a stable snapshot, so parse only when the raw string changes.
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function emit() {
  listeners.forEach((listener) => listener());
}

export function maxQuantityFor(line: Pick<CartLine, "stock">): number {
  return Math.min(line.stock, MAX_QUANTITY_PER_LINE);
}

/** Current cart lines. Returns the same array reference until the stored cart changes. */
export function getCartLines(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cache.lines;
  }
  if (raw === cache.raw) return cache.lines;

  let lines = EMPTY;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isCartLine)) lines = parsed;
    } catch {
      // Corrupt data is treated as an empty cart.
    }
  }
  cache = { raw, lines };
  return lines;
}

export function writeCartLines(lines: CartLine[]) {
  const raw = JSON.stringify(lines);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Storage unavailable (private mode, quota): keep the cart in memory for this session.
  }
  cache = { raw, lines: lines.length === 0 ? EMPTY : lines };
  emit();
}

export function subscribeToCart(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Adds units of a variant, never exceeding available stock. Returns how many units were added. */
export function addToCart(line: Omit<CartLine, "quantity">, quantity: number): { added: number } {
  const lines = getCartLines();
  const existing = lines.find((item) => item.variantId === line.variantId);
  const inCart = existing?.quantity ?? 0;
  const room = maxQuantityFor(line) - inCart;
  const added = Math.max(0, Math.min(quantity, room));
  if (added === 0) return { added: 0 };

  const updated: CartLine = { ...line, quantity: inCart + added };
  writeCartLines(
    existing
      ? lines.map((item) => (item.variantId === line.variantId ? updated : item))
      : [...lines, updated],
  );
  return { added };
}

export function setCartQuantity(variantId: string, quantity: number) {
  const lines = getCartLines();
  writeCartLines(
    lines.map((line) =>
      line.variantId === variantId
        ? { ...line, quantity: Math.max(1, Math.min(quantity, maxQuantityFor(line))) }
        : line,
    ),
  );
}

export function removeFromCart(variantId: string) {
  writeCartLines(getCartLines().filter((line) => line.variantId !== variantId));
}

export function clearCart() {
  writeCartLines([]);
}

/**
 * Merges a server validation result into the live cart. Lines are matched by variant so changes
 * made while the request was in flight survive; quantities are re-capped to the fresh stock.
 */
export function applyValidatedCart(result: Extract<ValidatedCart, { ok: true }>) {
  const fresh = new Map(result.lines.map((line) => [line.variantId, line]));
  const removed = new Set(result.removedVariantIds);

  const next = getCartLines().flatMap((line) => {
    if (removed.has(line.variantId)) return [];
    const updated = fresh.get(line.variantId);
    if (!updated) return [line];
    return [{ ...updated, quantity: Math.min(line.quantity, maxQuantityFor(updated)) }];
  });

  writeCartLines(next);
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0);
}
