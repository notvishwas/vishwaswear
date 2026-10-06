import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[16/10] lg:aspect-[16/6]" />
      <Container className="py-14">
        <Skeleton className="mx-auto h-8 w-56" />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
