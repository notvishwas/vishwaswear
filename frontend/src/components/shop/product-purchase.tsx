"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { openCartDrawer } from "@/lib/cart/drawer";
import { addToCart as addLineToCart } from "@/lib/cart/store";
import { getSwatchColor } from "@/lib/shop/colors";
import {
  LOW_STOCK_THRESHOLD,
  MAX_QUANTITY_PER_LINE,
  findVariant,
  getColors,
  getDefaultColor,
  getSizes,
  isColorAvailable,
  isFullySoldOut,
  isSizeAvailable,
  percentOff,
  type PurchasableVariant,
} from "@/lib/shop/variants";
import { cn } from "@/lib/utils";
import { SizeGuide } from "./size-guide";

type ProductPurchaseProps = {
  productId: string;
  slug: string;
  image: string | null;
  name: string;
  pricePaise: number;
  compareAtPaise: number | null;
  categorySlug: string;
  variants: PurchasableVariant[];
};

export function ProductPurchase({ productId, slug, image, name, pricePaise, compareAtPaise, categorySlug, variants }: ProductPurchaseProps) {
  const sizes = getSizes(variants);
  const colors = getColors(variants);
  const soldOut = variants.length === 0 || isFullySoldOut(variants);

  const [color, setColor] = useState<string | null>(() => getDefaultColor(variants));
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const ctaRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLFieldSetElement>(null);

  const variant = findVariant(variants, size, color);
  const maxQuantity = variant ? Math.min(variant.stock, MAX_QUANTITY_PER_LINE) : MAX_QUANTITY_PER_LINE;
  const safeQuantity = Math.min(quantity, maxQuantity);
  const lowStock = variant !== undefined && variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD;
  const discount = percentOff(pricePaise, compareAtPaise);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Only after the button has scrolled off the top, not while it is still below the fold.
      setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function selectSize(next: string) {
    setMessage(null);
    setSize((current) => (current === next ? null : next));
  }

  function selectColor(next: string) {
    setMessage(null);
    setColor(next);
  }

  function addToCart() {
    if (!variant) return;
    const { added } = addLineToCart(
      {
        variantId: variant.id,
        productId,
        slug,
        name,
        size: variant.size,
        color: variant.color,
        image,
        unitPricePaise: pricePaise,
        stock: variant.stock,
      },
      safeQuantity,
    );

    if (added === 0) {
      setMessage(`You already have all ${Math.min(variant.stock, MAX_QUANTITY_PER_LINE)} available in your cart.`);
      openCartDrawer();
      return;
    }
    setMessage(
      added < safeQuantity
        ? `Added ${added}. That is the most available in ${variant.size}, ${variant.color}.`
        : null,
    );
    openCartDrawer();
  }

  function scrollToSizes() {
    sizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const ctaLabel = soldOut ? "Out of stock" : !size ? "Select a size" : "Add to cart";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Price amount={pricePaise} compareAt={compareAtPaise ?? undefined} className="text-2xl" />
        {discount !== null && <Badge variant="gold">{discount}% off</Badge>}
      </div>

      {colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-navy-800">
            Colour: <span className="font-normal text-navy-500">{color}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((option) => {
              const available = isColorAvailable(variants, option, size);
              const selected = option === color;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!available}
                  onClick={() => selectColor(option)}
                  aria-label={available ? option : `${option}, unavailable in this size`}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-full border-2 p-0.5",
                    selected ? "border-gold-500" : "border-transparent hover:border-navy-200",
                    !available && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span
                    className="block size-full rounded-full border border-navy-800/15"
                    style={{ backgroundColor: getSwatchColor(option) }}
                  />
                  {!available && (
                    <span aria-hidden="true" className="absolute inset-x-1 top-1/2 h-px -rotate-45 bg-navy-500" />
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset ref={sizeSectionRef}>
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium text-navy-800">
              Size{size && <span className="font-normal text-navy-500">: {size}</span>}
            </legend>
            <SizeGuide categorySlug={categorySlug} className="text-sm text-navy-500 underline underline-offset-4 hover:text-navy-800">
              Size guide
            </SizeGuide>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((option) => {
              const available = isSizeAvailable(variants, option, color);
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!available}
                  onClick={() => selectSize(option)}
                  aria-pressed={selected}
                  aria-label={available ? `Size ${option}` : `Size ${option}, out of stock`}
                  className={cn(
                    "relative inline-flex h-11 min-w-12 items-center justify-center rounded-md border px-3 text-sm font-medium",
                    selected
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-navy-200 bg-white text-navy-800 hover:border-navy-800",
                    !available && "cursor-not-allowed border-dashed bg-cream-200 text-navy-300 line-through hover:border-navy-200",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {lowStock && variant && (
            <p className="mt-3 text-sm font-medium text-gold-700" role="status">
              Only {variant.stock} left in {variant.size}, {variant.color}
            </p>
          )}
        </fieldset>
      )}

      <div>
        <p id="quantity-label" className="text-sm font-medium text-navy-800">
          Quantity
        </p>
        <QuantityStepper
          value={safeQuantity}
          max={maxQuantity}
          label={name}
          disabled={soldOut}
          onChange={setQuantity}
          className="mt-3"
        />
      </div>

      <div ref={ctaRef} className="flex flex-col gap-3">
        <Button size="lg" className="w-full" disabled={soldOut || !size} onClick={addToCart}>
          {ctaLabel}
        </Button>
        {!soldOut && !size && (
          <p className="text-sm text-navy-500">Choose a size to add this piece to your cart.</p>
        )}
        {soldOut && <p className="text-sm text-navy-500">This piece is currently out of stock.</p>}
        {message && (
          <p role="status" className="text-sm text-navy-500">
            {message}
          </p>
        )}
      </div>

      {/* Mobile sticky bar, shown once the main button has scrolled out of view. */}
      <div
        aria-hidden={!showStickyBar}
        inert={!showStickyBar}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-100 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(15,27,45,0.08)] transition-transform duration-200 lg:hidden",
          showStickyBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-800">{name}</p>
            <Price amount={pricePaise} className="text-sm" />
          </div>
          <Button
            className="shrink-0"
            disabled={soldOut}
            onClick={size ? addToCart : scrollToSizes}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
