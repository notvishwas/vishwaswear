import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Paginated, ProductWithDetails } from "@/types";
import { productFiltersSchema, type ProductFiltersInput } from "./product-filters";

const PRODUCT_SELECT = `
  *,
  category:categories!inner(*),
  images:product_images(*),
  variants:product_variants(*)
` as const;

/** Sorts nested rows in memory; PostgREST can't order embedded rows deterministically across all cases. */
function normalize(product: ProductWithDetails): ProductWithDetails {
  return {
    ...product,
    images: [...product.images].sort((a, b) => a.sort_order - b.sort_order),
    variants: [...product.variants].sort(
      (a, b) => a.color.localeCompare(b.color) || a.size.localeCompare(b.size, undefined, { numeric: true }),
    ),
  };
}

/** Strips characters that have meaning in PostgREST filters and LIKE patterns. */
function sanitizeSearch(value: string): string {
  return value.replace(/[%_,()*\\]/g, " ").trim();
}

/** Product ids that have an in-stock variant matching the size and/or colour. */
async function findProductIdsByVariant(size?: string, color?: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("product_variants").select("product_id").gt("stock", 0);
  if (size) query = query.eq("size", size);
  if (color) query = query.ilike("color", sanitizeSearch(color));

  const { data, error } = await query;
  if (error) throw new Error(`Failed to filter by variant: ${error.message}`);
  return [...new Set(data.map((row) => row.product_id))];
}

export async function getProducts(
  input: ProductFiltersInput = {},
): Promise<Paginated<ProductWithDetails>> {
  const filters = productFiltersSchema.parse(input);
  const supabase = await createServerSupabaseClient();

  let variantProductIds: string[] | null = null;
  if (filters.size || filters.color) {
    variantProductIds = await findProductIdsByVariant(filters.size, filters.color);
    if (variantProductIds.length === 0) {
      return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize, totalPages: 0 };
    }
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (filters.category) query = query.eq("category.slug", filters.category);
  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.minPrice !== undefined) query = query.gte("price_paise", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_paise", filters.maxPrice);
  if (variantProductIds) query = query.in("id", variantProductIds);

  if (filters.search) {
    const term = sanitizeSearch(filters.search);
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,fabric.ilike.%${term}%`);
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price_paise", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_paise", { ascending: false });
      break;
    case "featured":
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  // Stable tiebreaker so pagination never repeats or skips rows.
  query = query.order("id");

  const from = (filters.page - 1) * filters.pageSize;
  const { data, error, count } = await query.range(from, from + filters.pageSize - 1);

  if (error?.code === "PGRST103") {
    // Page is past the end of the results. Return the real total so callers can redirect.
    const firstPage = await getProducts({ ...input, page: 1 });
    return { ...firstPage, items: [], page: filters.page };
  }
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const total = count ?? 0;
  return {
    items: data.map(normalize),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? normalize(data) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
  const { items } = await getProducts({ featured: true, sort: "newest", pageSize: limit });
  return items;
}

/** Other active products from the same category, newest first. */
export async function getRelatedProducts(
  product: Pick<ProductWithDetails, "id" | "category_id">,
  limit = 4,
): Promise<ProductWithDetails[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load related products: ${error.message}`);
  return data.map(normalize);
}
