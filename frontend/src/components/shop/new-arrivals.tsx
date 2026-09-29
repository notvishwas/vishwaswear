import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ProductWithDetails } from "@/types";
import { ProductCard } from "./product-card";

export function NewArrivals({ products }: { products: ProductWithDetails[] }) {
  return (
    <section aria-labelledby="new-arrivals-heading" className="py-14 sm:py-20">
      <Container>
        <SectionHeading id="new-arrivals-heading" eyebrow="Just in" title="New arrivals" />
      </Container>

      {products.length === 0 ? (
        <Container>
          <p className="mt-10 text-navy-500">New arrivals are on their way.</p>
        </Container>
      ) : (
        <ul
          className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:gap-4 sm:px-6 lg:mx-auto lg:max-w-page lg:px-8 [&::-webkit-scrollbar]:hidden"
          aria-label="New arrivals"
        >
          {products.map((product) => (
            <li key={product.id} className="w-[62%] shrink-0 snap-start sm:w-[36%] md:w-[28%] lg:w-[22%]">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
