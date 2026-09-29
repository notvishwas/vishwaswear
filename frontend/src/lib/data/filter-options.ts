import "server-only";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ShopFilterOptions = {
  sizes: string[];
  colors: string[];
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function compareSizes(a: string, b: string) {
  const rankA = SIZE_ORDER.indexOf(a);
  const rankB = SIZE_ORDER.indexOf(b);
  if (rankA !== -1 && rankB !== -1) return rankA - rankB;
  return a.localeCompare(b, undefined, { numeric: true });
}

/** Sizes and colours that are currently in stock, optionally within one category. */
export const getShopFilterOptions = cache(
  async (categorySlug?: string): Promise<ShopFilterOptions> => {
    const supabase = await createServerSupabaseClient();
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
