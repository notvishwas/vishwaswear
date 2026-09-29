import "server-only";
import { z } from "zod";
import { MAX_QUANTITY_PER_LINE } from "@/lib/shop/variants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { CartLine, CartWarning, ValidatedCart } from "@/types/cart";

export const cartItemsSchema = z
  .array(
    z.object({
      variantId: z.uuid(),
      quantity: z.number().int().min(1).max(999),
      /** What the client is showing. Used only to detect a price change, never as the price. */
      unitPricePaise: z.number().int().nonnegative(),
    }),
  )
  .max(50);

export type CartItemsInput = z.input<typeof cartItemsSchema>;

/**
 * Re-reads current prices and stock from Supabase and returns corrected lines with warnings.
 * The client's prices are never trusted: every returned price comes from the database.
 */
export async function validateCartItems(input: CartItemsInput): Promise<ValidatedCart> {
  const parsed = cartItemsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Your cart could not be read. Please refresh the page." };

  if (parsed.data.length === 0) return { ok: true, lines: [], removedVariantIds: [], warnings: [] };

  // Merge duplicate variants so quantity checks apply to the total.
  const requested = new Map<string, { quantity: number; clientPricePaise: number }>();
  for (const item of parsed.data) {
    const existing = requested.get(item.variantId);
    requested.set(item.variantId, {
      quantity: (existing?.quantity ?? 0) + item.quantity,
      clientPricePaise: item.unitPricePaise,
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, size, color, stock, product:products!inner(id, slug, name, price_paise, is_active, images:product_images(url, sort_order))",
    )
    .in("id", [...requested.keys()]);

  if (error) return { ok: false, error: "We couldn't check your cart just now. Please try again." };

  const current = new Map(data.map((variant) => [variant.id, variant]));
  const lines: CartLine[] = [];
  const removedVariantIds: string[] = [];
  const warnings: CartWarning[] = [];

  for (const [variantId, request] of requested) {
    const variant = current.get(variantId);

    // RLS hides variants of inactive products, so a missing row means it is no longer sold.
    if (!variant || !variant.product.is_active) {
      removedVariantIds.push(variantId);
      warnings.push({
        variantId,
        kind: "unavailable",
        message: "An item in your cart is no longer available and was removed.",
      });
      continue;
    }

    const { product } = variant;
    const label = `${product.name} (${variant.size}, ${variant.color})`;

    if (variant.stock <= 0) {
      removedVariantIds.push(variantId);
      warnings.push({ variantId, kind: "out_of_stock", message: `${label} is out of stock and was removed.` });
      continue;
    }

    const maxQuantity = Math.min(variant.stock, MAX_QUANTITY_PER_LINE);
    const quantity = Math.min(request.quantity, maxQuantity);

    if (quantity < request.quantity) {
      warnings.push({
        variantId,
        kind: "quantity_reduced",
        message: `Only ${maxQuantity} of ${label} available. We reduced the quantity to ${quantity}.`,
      });
    }

    if (product.price_paise !== request.clientPricePaise) {
      warnings.push({
        variantId,
        kind: "price_changed",
        message: `The price of ${label} changed from ${formatPrice(request.clientPricePaise)} to ${formatPrice(product.price_paise)}.`,
      });
    }

    const image = [...product.images].sort((a, b) => a.sort_order - b.sort_order)[0];
    lines.push({
      variantId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      color: variant.color,
      image: image?.url ?? null,
      unitPricePaise: product.price_paise,
      quantity,
      stock: variant.stock,
    });
  }

  return { ok: true, lines, removedVariantIds, warnings };
}
