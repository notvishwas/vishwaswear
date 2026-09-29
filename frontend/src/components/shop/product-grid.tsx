import { Skeleton } from "@/components/ui/skeleton";
import type { ProductWithDetails } from "@/types";
import { ProductCard } from "./product-card";

// 2 columns on mobile, 3 beside the filter sidebar, 4 on wide screens.
const GRID_CLASSES = "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({ products }: { products: ProductWithDetails[] }) {
  return (
    <ul className={GRID_CLASSES}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}

/** Same grid and card proportions as ProductGrid so the page doesn't jump when data arrives. */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading products</span>
      <ul className={GRID_CLASSES} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}
