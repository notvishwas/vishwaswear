import type { ProductWithDetails } from "@/types";

const NEW_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isNewProduct(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < NEW_WINDOW_DAYS * DAY_MS;
}

/** True when the product has variants and every one of them is out of stock. */
export function isSoldOut(product: Pick<ProductWithDetails, "variants">): boolean {
  return product.variants.length > 0 && product.variants.every((variant) => variant.stock === 0);
}
