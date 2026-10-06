import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="mt-8 h-72" />
      </div>
    </div>
  );
}
