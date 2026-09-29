import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category } from "@/types";
import { CategoryCard } from "./category-card";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-heading" className="py-14 sm:py-20">
      <Container>
        <SectionHeading
          id="categories-heading"
          eyebrow="Browse"
          title="Shop by category"
          align="center"
        />
        {categories.length === 0 ? (
          <p className="mt-10 text-center text-navy-500">
            Our categories are being set up. Please check back shortly.
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {categories.map((category) => (
              <li key={category.id}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
