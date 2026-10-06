import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories, getProducts } from "@/lib/data";

// Temporary page to confirm the data layer works against a live Supabase project.
// Delete once the real shop pages exist.
export const dynamic = "force-dynamic";
export const metadata = { title: "Catalog check", robots: { index: false } };

export default async function CatalogCheckPage() {
  let data;
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ pageSize: 24 }),
    ]);
    data = { categories, products };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    data = { message };
  }

  if ("message" in data) {
    return (
      <div className="py-12">
        <Container size="narrow">
          <p role="alert" className="text-red-700">
            Could not load the catalog: {data.message}
          </p>
        </Container>
      </div>
    );
  }

  const { categories, products } = data;

  return (
    <div className="py-12">
      <Container className="flex flex-col gap-10">
        <SectionHeading as="h1" title="Catalog check" />

        <section aria-labelledby="categories-heading" className="flex flex-col gap-3">
          <h2 id="categories-heading" className="text-lg font-semibold">
            Categories ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <p className="text-navy-500">No categories yet. Run supabase/seed.sql.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.id} className="rounded-md border border-navy-200 px-3 py-1 text-sm">
                  {category.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="products-heading" className="flex flex-col gap-3">
          <h2 id="products-heading" className="text-lg font-semibold">
            Products ({products.total})
          </h2>
          {products.items.length === 0 ? (
            <p className="text-navy-500">No products yet. Run supabase/seed.sql.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.items.map((product) => (
                <li key={product.id} className="flex flex-col gap-2">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      width={400}
                      height={500}
                      className="aspect-[4/5] w-full rounded-md object-cover"
                    />
                  )}
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-navy-400">
                    {product.category.name} · {product.variants.length} variants
                  </p>
                  <Price amount={product.price_paise} compareAt={product.compare_at_price_paise ?? undefined} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </div>
  );
}
