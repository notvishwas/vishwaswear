import "server-only";
import { getAdminDb } from "@/lib/auth/admin";
import type { Category, Paginated, Product, ProductImage, ProductVariant } from "@/types";
import { sanitizeSearch, type TableQuery } from "./table";

export const PRODUCT_SORT_KEYS = ["created_at", "name", "price_paise"] as const;
export type ProductSortKey = (typeof PRODUCT_SORT_KEYS)[number];

export type AdminProductRow = Pick<Product, "id" | "name" | "slug" | "price_paise" | "is_active" | "is_featured"> & {
  categoryName: string;
  imageUrl: string | null;
  imageAlt: string;
  totalStock: number;
};

const PAGE_SIZE = 15;

export async function listProducts(query: TableQuery<ProductSortKey>): Promise<Paginated<AdminProductRow>> {
  const db = await getAdminDb();

  let request = db
    .from("products")
    .select(
      "id, name, slug, price_paise, is_active, is_featured, category:categories(name), images:product_images(url, alt, sort_order), variants:product_variants(stock)",
      { count: "exact" },
    );

  const term = sanitizeSearch(query.q);
  if (term) request = request.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);

  const from = (query.page - 1) * PAGE_SIZE;
  const { data, error, count } = await request
    .order(query.sort, { ascending: query.dir === "asc" })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  if (error?.code === "PGRST103") return { items: [], total: 0, page: query.page, pageSize: PAGE_SIZE, totalPages: 0 };
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const total = count ?? 0;
  return {
    items: data.map((product) => {
      const image = [...product.images].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price_paise: product.price_paise,
        is_active: product.is_active,
        is_featured: product.is_featured,
        categoryName: product.category?.name ?? "",
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? "",
        totalStock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
      };
    }),
    total,
    page: query.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export type ProductForEdit = Product & { images: ProductImage[]; variants: ProductVariant[] };

export async function getProductForEdit(id: string): Promise<ProductForEdit | null> {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!data) return null;

  return {
    ...data,
    images: [...data.images].sort((a, b) => a.sort_order - b.sort_order),
    variants: [...data.variants].sort((a, b) => a.color.localeCompare(b.color) || a.size.localeCompare(b.size, undefined, { numeric: true })),
  };
}

export async function listCategoryOptions(): Promise<Pick<Category, "id" | "name">[]> {
  const db = await getAdminDb();
  const { data, error } = await db.from("categories").select("id, name").order("sort_order").order("name");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data;
}
