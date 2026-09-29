"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { validateCart } from "@/actions/cart";
import { applyValidatedCart, getCartLines } from "@/lib/cart/store";
import type { CartWarning } from "@/types/cart";

type SyncStatus = "idle" | "validating" | "error";

/** Re-checks the cart against the server (prices and stock) and applies the corrections locally. */
export function useCartSync() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [warnings, setWarnings] = useState<CartWarning[]>([]);
  const [error, setError] = useState<string | null>(null);

  /** Resolves true when the cart is valid as it stood, with nothing corrected. */
  const validate = useCallback(async (): Promise<boolean> => {
    const lines = getCartLines();
    if (lines.length === 0) {
      setWarnings([]);
      return true;
    }

    setStatus("validating");
    setError(null);
    try {
      const result = await validateCart(
        lines.map(({ variantId, quantity, unitPricePaise }) => ({ variantId, quantity, unitPricePaise })),
      );
      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return false;
      }
      applyValidatedCart(result);
      setWarnings(result.warnings);
      setStatus("idle");
      return result.warnings.length === 0;
    } catch {
      setStatus("error");
      setError("We couldn't check your cart just now. Please try again.");
      return false;
    }
  }, []);

  /** Validates first; only moves on to checkout when nothing changed. */
  const proceedToCheckout = useCallback(async () => {
    const clean = await validate();
    if (clean && getCartLines().length > 0) router.push("/checkout");
  }, [validate, router]);

  const dismissWarnings = useCallback(() => setWarnings([]), []);

  return { status, warnings, error, validate, proceedToCheckout, dismissWarnings };
}
