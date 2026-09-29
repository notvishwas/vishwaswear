import { compareSizes } from "./sizes";

export type PurchasableVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
};

export const LOW_STOCK_THRESHOLD = 5;
export const MAX_QUANTITY_PER_LINE = 10;

export function getSizes(variants: PurchasableVariant[]): string[] {
  return [...new Set(variants.map((variant) => variant.size))].sort(compareSizes);
}

/** Colours in the order they first appear. */
export function getColors(variants: PurchasableVariant[]): string[] {
  return [...new Set(variants.map((variant) => variant.color))];
}

export function findVariant(
  variants: PurchasableVariant[],
  size: string | null,
  color: string | null,
): PurchasableVariant | undefined {
  if (!size || !color) return undefined;
  return variants.find((variant) => variant.size === size && variant.color === color);
}

/** A size is available if the chosen colour has it in stock. */
export function isSizeAvailable(variants: PurchasableVariant[], size: string, color: string | null): boolean {
  return variants.some(
    (variant) => variant.size === size && (color === null || variant.color === color) && variant.stock > 0,
  );
}

/** A colour is available if the chosen size (or any size, when none is chosen) is in stock in it. */
export function isColorAvailable(variants: PurchasableVariant[], color: string, size: string | null): boolean {
  return variants.some(
    (variant) => variant.color === color && (size === null || variant.size === size) && variant.stock > 0,
  );
}

/** First colour with any stock, falling back to the first colour. */
export function getDefaultColor(variants: PurchasableVariant[]): string | null {
  const colors = getColors(variants);
  return colors.find((color) => isColorAvailable(variants, color, null)) ?? colors[0] ?? null;
}

export function isFullySoldOut(variants: PurchasableVariant[]): boolean {
  return variants.every((variant) => variant.stock === 0);
}

export function percentOff(pricePaise: number, compareAtPaise: number | null): number | null {
  if (compareAtPaise === null || compareAtPaise <= pricePaise) return null;
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}
