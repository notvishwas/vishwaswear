import { z } from "zod";

/** One line in the client-side cart. Prices here are display values; the server re-checks them. */
export const cartLineSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  image: z.string().nullable(),
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  /** Units available when the line was last validated; caps the quantity. */
  stock: z.number().int().nonnegative(),
});

export type CartLine = z.infer<typeof cartLineSchema>;

export type CartWarningKind = "price_changed" | "out_of_stock" | "quantity_reduced" | "unavailable";

export type CartWarning = {
  variantId: string;
  kind: CartWarningKind;
  message: string;
};

export type ValidatedCart =
  | {
      ok: true;
      /** Current, corrected data for every variant that can still be bought. */
      lines: CartLine[];
      /** Variants that must be dropped from the cart. */
      removedVariantIds: string[];
      warnings: CartWarning[];
    }
  | { ok: false; error: string };
