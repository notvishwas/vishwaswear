import type { CartLine } from "@/types/cart";

const STORAGE_KEY = "checkout:attempt";

function newId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** One id per checkout attempt, kept for the browser session and reset after a confirmed payment. */
function getAttemptId(): string {
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = newId();
    window.sessionStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return newId();
  }
}

export function resetCheckoutAttempt() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to reset if storage is unavailable.
  }
}

async function digest(text: string): Promise<string> {
  if (crypto.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
  }
  // Insecure contexts have no SubtleCrypto; a simple FNV-1a hash is enough to tell carts apart.
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Key that is stable for the same attempt and cart contents, and changes when the cart changes.
 * Submitting twice (double click, retry after closing the payment window) therefore reuses one order.
 */
export async function buildIdempotencyKey(lines: Pick<CartLine, "variantId" | "quantity">[]): Promise<string> {
  const cartSignature = lines
    .map((line) => `${line.variantId}:${line.quantity}`)
    .sort()
    .join("|");
  return `${getAttemptId()}:${await digest(cartSignature)}`;
}
