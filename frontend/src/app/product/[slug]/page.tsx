import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { ProductAccordion } from "@/components/shop/product-accordion";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductJsonLd } from "@/components/shop/product-json-ld";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const description = truncate(
    product.description ?? `${product.name} in ${product.fabric ?? "fine fabric"}.`,
    160,
  );
  const image = product.images[0];

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      type: "website",
      images: image ? [{ url: image.url, alt: image.alt || product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  return (
    <div className="pb-24 lg:pb-0">
      <ProductJsonLd product={product} />

      <Container className="py-6 sm:py-10">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.category.name, href: `/shop/${product.category.slug}` },
            { label: product.name, href: `/product/${product.slug}` },
          ]}
        />

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              images={product.images.map(({ id, url, alt }) => ({ id, url, alt }))}
              productName={product.name}
            />
          </div>

          <div className="mt-8 flex flex-col gap-8 lg:mt-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                {product.category.name}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-800 sm:text-3xl">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-4 text-sm leading-relaxed text-navy-500 sm:text-base">{product.description}</p>
              )}
            </div>

            <ProductPurchase
              productId={product.id}
              slug={product.slug}
              image={product.images[0]?.url ?? null}
              name={product.name}
              pricePaise={product.price_paise}
              compareAtPaise={product.compare_at_price_paise}
              categorySlug={product.category.slug}
              variants={product.variants.map(({ id, size, color, sku, stock }) => ({ id, size, color, sku, stock }))}
            />

            <ProductAccordion product={product} categorySlug={product.category.slug} />
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-white py-14 sm:py-20">
          <Container>
            <SectionHeading id="related-heading" eyebrow="You may also like" title="Related pieces" align="center" />
            <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
