import { siteConfig } from "@/config/site";
import { isFullySoldOut } from "@/lib/shop/variants";
import type { ProductWithDetails } from "@/types";
import { JsonLd } from "./json-ld";

export function ProductJsonLd({ product }: { product: ProductWithDetails }) {
  const url = new URL(`/product/${product.slug}`, siteConfig.url).toString();
  const inStock = product.variants.length > 0 && !isFullySoldOut(product.variants);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description ?? undefined,
        image: product.images.map((image) => new URL(image.url, siteConfig.url).toString()),
        sku: product.variants[0]?.sku,
        category: product.category.name,
        material: product.fabric ?? undefined,
        brand: { "@type": "Brand", name: siteConfig.name },
        offers: {
          "@type": "Offer",
          url,
          price: (product.price_paise / 100).toFixed(2),
          priceCurrency: siteConfig.currency,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      }}
    />
  );
}
