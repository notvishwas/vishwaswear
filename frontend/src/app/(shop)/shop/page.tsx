import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShopListing } from "@/components/shop/shop-listing";
import { buildShopHref, parseShopQuery } from "@/lib/shop/query";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { page } = parseShopQuery(await searchParams);
  return {
    title: "Shop",
    description:
      "Browse tailored suits, blazers, coats, trousers and shirts. Filter by size, colour and price.",
    // Filters and sorting share one canonical URL; only pagination is indexed separately.
    alternates: { canonical: page > 1 ? `/shop?page=${page}` : "/shop" },
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const raw = await searchParams;
  const query = parseShopQuery(raw);

  // Older links used /shop?category=slug; category pages now live at /shop/slug.
  const legacyCategory = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  if (legacyCategory && /^[a-z0-9-]+$/.test(legacyCategory)) {
    redirect(buildShopHref(`/shop/${legacyCategory}`, query));
  }

  return <ShopListing query={query} />;
}
