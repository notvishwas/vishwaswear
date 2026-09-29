"use client";

import { useRouter } from "next/navigation";
import { SHOP_SORTS, buildShopHref, type ShopQuery } from "@/lib/shop/query";

type SortSelectProps = {
  basePath: string;
  query: ShopQuery;
};

export function SortSelect({ basePath, query }: SortSelectProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="hidden text-sm text-navy-500 sm:block">
        Sort by
      </label>
      <select
        id="sort"
        value={query.sort}
        onChange={(event) => {
          const sort = SHOP_SORTS.find((option) => option.value === event.target.value)?.value;
          if (sort) router.push(buildShopHref(basePath, { ...query, sort, page: 1 }));
        }}
        aria-label="Sort products"
        className="h-10 rounded-md border border-navy-200 bg-white px-3 text-sm text-navy-800 focus-visible:border-gold-500"
      >
        {SHOP_SORTS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
