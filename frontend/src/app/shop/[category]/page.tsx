import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopListing } from "@/components/shop/shop-listing";
import { getCategoryBySlug } from "@/lib/data";
import { parseShopQuery } from "@/lib/shop/query";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  const { page } = parseShopQuery(await searchParams);
  const path = `/shop/${category.slug}`;

  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name.toLowerCase()} in fine fabrics and considered fits.`,
    alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/shop/[category]">) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return <ShopListing category={category} query={parseShopQuery(await searchParams)} />;
}
