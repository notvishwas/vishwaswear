import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { countActiveFilters, type ShopQuery } from "@/lib/shop/query";
import type { Category } from "@/types";
import { Breadcrumbs } from "./breadcrumbs";
import { FilterPanel } from "./filter-panel";
import { FilterShell } from "./filter-shell";
import { ProductGridSkeleton } from "./product-grid";
import { ProductResults } from "./product-results";
import { SortSelect } from "./sort-select";

type ShopListingProps = {
  category?: Category;
  query: ShopQuery;
};

export function ShopListing({ category, query }: ShopListingProps) {
  const basePath = category ? `/shop/${category.slug}` : "/shop";
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(category ? [{ label: category.name, href: basePath }] : []),
  ];
  // Changing any filter remounts the results so the skeleton shows while they load.
  const resultsKey = JSON.stringify(query);

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs crumbs={crumbs} />
      <SectionHeading
        as="h1"
        title={category?.name ?? "The collection"}
        description={
          category?.description ??
          "Suits, blazers, coats, trousers and shirts, cut from fine fabrics and made to be worn."
        }
        className="my-8 sm:mb-10"
      />

      <FilterShell
        panel={
          <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
            <FilterPanel categorySlug={category?.slug} query={query} />
          </Suspense>
        }
        sort={<SortSelect basePath={basePath} query={query} />}
        activeCount={countActiveFilters(query)}
      >
        <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
          <ProductResults basePath={basePath} category={category} query={query} />
        </Suspense>
      </FilterShell>
    </Container>
  );
}
