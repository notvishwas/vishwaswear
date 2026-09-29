"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartLines, useCartSubtotal } from "@/hooks/use-cart";
import { useCartSync } from "@/hooks/use-cart-sync";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { CartWarnings } from "./cart-warnings";

function CartSkeleton() {
  return (
    <div role="status" aria-live="polite" className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <span className="sr-only">Loading your cart</span>
      <div className="flex flex-col gap-6" aria-hidden="true">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="aspect-[4/5] w-24" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-auto h-11 w-32" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-56 w-full lg:mt-0" />
    </div>
  );
}

export function CartPageContent() {
  const lines = useCartLines();
  const subtotal = useCartSubtotal();
  const { status, warnings, error, validate, proceedToCheckout, dismissWarnings } = useCartSync();
  const hasValidated = useRef(false);

  // Re-check prices and stock once per visit, as soon as the stored cart is available.
  const hydrated = lines !== null;
  useEffect(() => {
    if (!hydrated || hasValidated.current) return;
    hasValidated.current = true;
    void validate();
  }, [hydrated, validate]);

  if (lines === null) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <CartWarnings warnings={warnings} onDismiss={dismissWarnings} />
        <h2 className="mt-6 text-xl font-semibold text-navy-800">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-navy-500">
          Browse the collection and add a piece you like. It will be waiting here.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-md border border-navy-800 bg-navy-800 px-8 text-base font-semibold text-white hover:bg-navy-700"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
      <div>
        <CartWarnings warnings={warnings} onDismiss={dismissWarnings} />
        <ul className="divide-y divide-cream-300 border-y border-cream-300">
          {lines.map((line) => (
            <CartLineItem key={line.variantId} line={line} />
          ))}
        </ul>
        <Link
          href="/shop"
          className="mt-6 inline-block text-sm font-medium text-navy-800 underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>

      <aside
        aria-label="Order summary"
        className="mt-8 rounded-md border border-cream-300 bg-white p-5 lg:sticky lg:top-24 lg:mt-0"
      >
        <h2 className="mb-4 text-base font-semibold text-navy-800">Order summary</h2>
        {status === "validating" && (
          <p role="status" className="mb-3 text-xs text-navy-400">
            Checking current prices and stock…
          </p>
        )}
        {error && (
          <div role="alert" className="mb-3 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => void validate()} className="mt-1 font-semibold underline underline-offset-4">
              Try again
            </button>
          </div>
        )}
        <CartSummary subtotalPaise={subtotal}>
          <Button size="lg" loading={status === "validating"} onClick={proceedToCheckout}>
            Proceed to checkout
          </Button>
        </CartSummary>
      </aside>
    </div>
  );
}
