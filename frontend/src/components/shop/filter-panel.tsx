import Link from "next/link";
import { getCategories, getShopFilterOptions } from "@/lib/data";
import { PRICE_BUCKETS, buildShopHref, priceRangeLabel, type ShopQuery } from "@/lib/shop/query";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  /** Slug of the category page being viewed, if any. */
  categorySlug?: string;
  query: ShopQuery;
};

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm",
        active
          ? "border-navy-800 bg-navy-800 text-white"
          : "border-navy-200 bg-white text-navy-800 hover:border-navy-800",
      )}
    >
      {children}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-cream-300 py-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Filters are plain links, so every state is a shareable URL and works without JavaScript. */
export async function FilterPanel({ categorySlug, query }: FilterPanelProps) {
  const [categories, options] = await Promise.all([getCategories(), getShopFilterOptions(categorySlug)]);
  const basePath = categorySlug ? `/shop/${categorySlug}` : "/shop";
  const hrefWith = (change: Partial<ShopQuery>) => buildShopHref(basePath, { ...query, ...change, page: 1 });

  return (
    <div>
      <Group title="Category">
        <ul className="flex flex-col gap-1">
          {[{ name: "All products", slug: undefined }, ...categories].map((category) => {
            const active = category.slug === categorySlug;
            const href = buildShopHref(category.slug ? `/shop/${category.slug}` : "/shop", { ...query, page: 1 });
            return (
              <li key={category.slug ?? "all"}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block py-1.5 text-sm",
                    active ? "font-semibold text-navy-800" : "text-navy-500 hover:text-navy-800",
                  )}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </Group>

      {options.sizes.length > 0 && (
        <Group title="Size">
          <ul className="flex flex-wrap gap-2">
            {options.sizes.map((size) => (
              <li key={size}>
                <Pill href={hrefWith({ size: query.size === size ? undefined : size })} active={query.size === size}>
                  {size}
                </Pill>
              </li>
            ))}
          </ul>
        </Group>
      )}

      {options.colors.length > 0 && (
        <Group title="Colour">
          <ul className="flex flex-wrap gap-2">
            {options.colors.map((color) => (
              <li key={color}>
                <Pill href={hrefWith({ color: query.color === color ? undefined : color })} active={query.color === color}>
                  {color}
                </Pill>
              </li>
            ))}
          </ul>
        </Group>
      )}

      <Group title="Price">
        <ul className="flex flex-col gap-1">
          {PRICE_BUCKETS.map((bucket) => {
            const active = query.min === bucket.min && query.max === bucket.max;
            return (
              <li key={`${bucket.min}-${bucket.max}`}>
                <Link
                  href={hrefWith(active ? { min: undefined, max: undefined } : { min: bucket.min, max: bucket.max })}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "block py-1.5 text-sm",
                    active ? "font-semibold text-navy-800" : "text-navy-500 hover:text-navy-800",
                  )}
                >
                  {priceRangeLabel(bucket.min, bucket.max)}
                </Link>
              </li>
            );
          })}
        </ul>
      </Group>
    </div>
  );
}
