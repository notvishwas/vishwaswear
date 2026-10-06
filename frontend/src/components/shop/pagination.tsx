import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

/** Page numbers with the first, last and a window around the current page. */
function getPageItems(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) items.push("gap");
    items.push(n);
  });
  return items;
}

const baseClasses =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium";

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(baseClasses, "border-navy-200 hover:border-navy-800")}>
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(baseClasses, "border-transparent text-navy-200")}>
          Previous
        </span>
      )}

      <ul className="flex items-center gap-2">
        {getPageItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-navy-400">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  baseClasses,
                  item === page
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-navy-200 text-navy-800 hover:border-navy-800",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(baseClasses, "border-navy-200 hover:border-navy-800")}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(baseClasses, "border-transparent text-navy-200")}>
          Next
        </span>
      )}
    </nav>
  );
}
