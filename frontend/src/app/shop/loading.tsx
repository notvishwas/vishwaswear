import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shop/product-grid";

export default function ShopLoading() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-4 w-48" />
      <div className="my-8 flex flex-col gap-3 sm:mb-10">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <div className="hidden lg:block" />
        <div>
          <Skeleton className="mb-6 h-10 w-full" />
          <ProductGridSkeleton />
        </div>
      </div>
    </Container>
  );
}
