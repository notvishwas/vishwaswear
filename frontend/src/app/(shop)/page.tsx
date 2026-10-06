import { BrandPromise } from "@/components/shop/brand-promise";
import { CategoryGrid } from "@/components/shop/category-grid";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { Hero } from "@/components/shop/hero";
import { NewArrivals } from "@/components/shop/new-arrivals";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/data";

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
