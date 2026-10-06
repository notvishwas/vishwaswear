import "server-only";
import { getAdminDb } from "@/lib/auth/admin";
import type { Category } from "@/types";

export type AdminCategory = Category & { productCount: number };

/** All categories in display order, each with how many products it holds (active or not). */
export async function listCategoriesWithCounts(): Promise<AdminCategory[]> {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("categories")
    .select("*, products(count)")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data.map(({ products, ...category }) => ({ ...category, productCount: products[0]?.count ?? 0 }));
}
