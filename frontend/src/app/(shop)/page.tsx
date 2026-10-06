import type { Metadata } from "next";
import { BrandPromise } from "@/components/shop/brand-promise";
import { CategoryGrid } from "@/components/shop/category-grid";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { Hero } from "@/components/shop/hero";
import { NewArrivals } from "@/components/shop/new-arrivals";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/data";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Refreshed every two minutes, and immediately when the admin edits the catalogue.
export const revalidate = 120;

export default async function HomePage() {
  const [categories, featured, newest] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ sort: "newest", pageSize: 8 }),
  ]);

  return (
    <>
      <Hero image={featured[0]?.images[0]} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <NewArrivals products={newest.items} />
      <BrandPromise />
      <NewsletterForm />
    </>
  );
}
