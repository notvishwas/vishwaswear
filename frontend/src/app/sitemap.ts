import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

// Rebuilt at most once an hour; the catalogue rarely changes faster than search engines crawl.
export const revalidate = 3600;

const STATIC_PATHS = ["/about", "/shipping", "/returns", "/size-guide", "/privacy", "/terms", "/contact", "/track-order"];

/** Every public page: home, the shop, each category and each active product, read from the database. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const supabase = createPublicSupabaseClient();

  const [categories, products] = await Promise.all([
    supabase.from("categories").select("slug, updated_at").order("sort_order"),
    supabase.from("products").select("slug, updated_at").eq("is_active", true).order("created_at", { ascending: false }).limit(5000),
  ]);

  if (categories.error || products.error) {
    // Better a short sitemap than a failing one: crawlers retry later.
    console.error("[sitemap] catalogue query failed", categories.error?.message ?? products.error?.message);
  }

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), changeFrequency: "daily", priority: 0.9 },
    ...(categories.data ?? []).map((category) => ({
      url: url(`/shop/${category.slug}`),
      lastModified: category.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(products.data ?? []).map((product) => ({
      url: url(`/product/${product.slug}`),
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...STATIC_PATHS.map((path) => ({ url: url(path), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
