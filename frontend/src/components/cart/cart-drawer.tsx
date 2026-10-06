"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/button";
import { useCartDrawerOpen, useCartLines, useCartSubtotal } from "@/hooks/use-cart";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useCartSync } from "@/hooks/use-cart-sync";
import { closeCartDrawer } from "@/lib/cart/drawer";
import { cn } from "@/lib/utils";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { CartWarnings } from "./cart-warnings";

export function CartDrawer() {
  const open = useCartDrawerOpen();
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap(open, panelRef);
  const lines = useCartLines() ?? [];
  const subtotal = useCartSubtotal();
  const { status, warnings, error, proceedToCheckout, dismissWarnings } = useCartSync();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCartDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-navy-900/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[56] flex w-full max-w-md flex-col bg-cream-100 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-cream-300 px-4">
          <h2 className="text-base font-semibold text-navy-800">
            Your cart{itemCount > 0 && <span className="font-normal text-navy-500"> ({itemCount})</span>}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCartDrawer}
            className="inline-flex size-11 items-center justify-center rounded-md hover:bg-navy-800/5"
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-lg font-semibold text-navy-800">Your cart is empty</p>
            <p className="mt-2 text-sm text-navy-500">Pieces you add will appear here.</p>
            <Link
              href="/shop"
              onClick={closeCartDrawer}
              className="mt-6 inline-flex h-11 items-center rounded-md border border-navy-800 bg-navy-800 px-6 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <CartWarnings warnings={warnings} onDismiss={dismissWarnings} />
              <ul className="divide-y divide-cream-300">
                {lines.map((line) => (
                  <CartLineItem key={line.variantId} line={line} onNavigate={closeCartDrawer} />
                ))}
              </ul>
            </div>

            <div className="shrink-0 border-t border-cream-300 bg-white p-4">
              {error && (
                <p role="alert" className="mb-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <CartSummary subtotalPaise={subtotal}>
                <Button size="lg" loading={status === "validating"} onClick={proceedToCheckout}>
                  Proceed to checkout
                </Button>
                <Link
                  href="/cart"
                  onClick={closeCartDrawer}
                  className="text-center text-sm font-medium text-navy-800 underline underline-offset-4"
                >
                  View full cart
                </Link>
              </CartSummary>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
