import Link from "next/link";
import { redirect } from "next/navigation";
import { getProducts } from "@/lib/data";
import { PAGE_SIZE, buildShopHref, hasActiveFilters, priceRangeLabel, type ShopQuery } from "@/lib/shop/query";
import type { Category } from "@/types";
import { Pagination } from "./pagination";
import { ProductGrid } from "./product-grid";

type ProductResultsProps = {
  basePath: string;
  category?: Category;
  query: ShopQuery;
};

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-navy-200 bg-white px-3 text-xs font-medium text-navy-800 hover:border-navy-800"
    >
      {label}
      <span aria-hidden="true" className="text-navy-400">
        ×
      </span>
    </Link>
  );
}

export async function ProductResults({ basePath, category, query }: ProductResultsProps) {
  const result = await getProducts({
    category: category?.slug,
    size: query.size,
    color: query.color,
    minPrice: query.min === undefined ? undefined : query.min * 100,
    maxPrice: query.max === undefined ? undefined : query.max * 100,
    sort: query.sort,
    page: query.page,
    pageSize: PAGE_SIZE,
  });

  // A stale or hand-edited page number past the end lands on the last page.
  if (result.total > 0 && query.page > result.totalPages) {
    redirect(buildShopHref(basePath, { ...query, page: result.totalPages }));
  }

  const filtersActive = hasActiveFilters(query);
  const clearHref = buildShopHref(basePath, { sort: query.sort });
  const withoutFilter = (change: Partial<ShopQuery>) => buildShopHref(basePath, { ...query, ...change, page: 1 });

  const firstShown = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const lastShown = (result.page - 1) * result.pageSize + result.items.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm text-navy-500" aria-live="polite">
          {result.total === 0
            ? "No products"
            : `Showing ${firstShown}–${lastShown} of ${result.total} ${result.total === 1 ? "product" : "products"}`}
        </p>
        {category && <Chip href={buildShopHref("/shop", { ...query, page: 1 })} label={category.name} />}
        {query.size && <Chip href={withoutFilter({ size: undefined })} label={`Size ${query.size}`} />}
        {query.color && <Chip href={withoutFilter({ color: undefined })} label={query.color} />}
        {(query.min !== undefined || query.max !== undefined) && (
          <Chip href={withoutFilter({ min: undefined, max: undefined })} label={priceRangeLabel(query.min, query.max)} />
        )}
        {filtersActive && (
          <Link href={clearHref} scroll={false} className="text-xs font-semibold text-navy-800 underline underline-offset-4">
            Clear all
          </Link>
        )}
      </div>

      <div className="mt-6">
        {result.items.length === 0 ? (
          <div className="flex flex-col items-center rounded-md border border-dashed border-navy-200 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-navy-800">
              {filtersActive ? "No pieces match those filters" : "Nothing here yet"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-navy-500">
              {filtersActive
                ? "Try removing a filter or widening the price range to see more of the collection."
                : "New pieces are added regularly. Browse the full collection in the meantime."}
            </p>
            <Link
              href={filtersActive ? clearHref : "/shop"}
              className="mt-6 inline-flex h-11 items-center rounded-md border border-navy-800 bg-navy-800 px-6 text-sm font-semibold text-white hover:bg-navy-700"
            >
              {filtersActive ? "Clear filters" : "Shop all products"}
            </Link>
          </div>
        ) : (
          <ProductGrid products={result.items} />
        )}
      </div>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        hrefFor={(page) => buildShopHref(basePath, { ...query, page })}
      />
    </div>
  );
}
