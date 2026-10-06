import "server-only";
import { cache } from "react";
import { compareSizes } from "@/lib/shop/sizes";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type ShopFilterOptions = {
  sizes: string[];
  colors: string[];
};

/** Sizes and colours that are currently in stock, optionally within one category. */
export const getShopFilterOptions = cache(
  async (categorySlug?: string): Promise<ShopFilterOptions> => {
    const supabase = createPublicSupabaseClient();
    let query = supabase
      .from("product_variants")
      .select("size, color, product:products!inner(is_active, category:categories!inner(slug))")
      .gt("stock", 0)
      .eq("product.is_active", true);

    if (categorySlug) query = query.eq("product.category.slug", categorySlug);

    const { data, error } = await query.limit(5000);
    if (error) throw new Error(`Failed to load filter options: ${error.message}`);

    return {
      sizes: [...new Set(data.map((row) => row.size))].sort(compareSizes),
      colors: [...new Set(data.map((row) => row.color))].sort((a, b) => a.localeCompare(b)),
    };
  },
);
