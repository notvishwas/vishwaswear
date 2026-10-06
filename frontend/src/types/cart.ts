/** One line in the client-side cart. Prices here are display values; the server re-checks them. */
export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  image: string | null;
  unitPricePaise: number;
  quantity: number;
  /** Units available when the line was last validated; caps the quantity. */
  stock: number;
};

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
