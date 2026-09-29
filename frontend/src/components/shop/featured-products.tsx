import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ProductWithDetails } from "@/types";
import { ProductCard } from "./product-card";

export function FeaturedProducts({ products }: { products: ProductWithDetails[] }) {
  return (
    <section aria-labelledby="featured-heading" className="bg-white py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="featured-heading"
          eyebrow="Our picks"
          title="Featured pieces"
          description="The pieces our tailors reach for first, in the fabrics and fits customers come back for."
          align="center"
        />
        {products.length === 0 ? (
          <p className="mt-10 text-center text-navy-500">
            Featured pieces are coming soon.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-md border border-navy-800 px-6 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-800 hover:text-white"
          >
            View all products
          </Link>
        </div>
      </Container>
    </section>
  );
}
