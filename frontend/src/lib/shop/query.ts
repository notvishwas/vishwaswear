import { z } from "zod";
import { formatPrice } from "@/lib/utils";

export const PAGE_SIZE = 12;

export const SHOP_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

/** Price buckets in rupees. An omitted bound is open-ended. */
export const PRICE_BUCKETS = [
  { min: undefined, max: 2500 },
  { min: 2500, max: 10000 },
  { min: 10000, max: 20000 },
  { min: 20000, max: undefined },
] as const;

const rupees = z.coerce.number().int().min(0).max(1_000_000).optional().catch(undefined);

const shopQuerySchema = z.object({
  sort: z.enum(["newest", "price-asc", "price-desc"]).catch("newest"),
  size: z.string().trim().min(1).max(12).optional().catch(undefined),
  color: z.string().trim().min(1).max(30).optional().catch(undefined),
  min: rupees,
  max: rupees,
  page: z.coerce.number().int().min(1).max(500).catch(1),
});

export type ShopQuery = z.infer<typeof shopQuerySchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseShopQuery(raw: RawSearchParams): ShopQuery {
  return shopQuerySchema.parse({
    sort: first(raw.sort),
    size: first(raw.size),
    color: first(raw.color),
    min: first(raw.min),
    max: first(raw.max),
    page: first(raw.page),
  });
}

/** Builds a shareable listing URL. Defaults (newest, page 1) are left out. */
export function buildShopHref(basePath: string, query: Partial<ShopQuery>): string {
  const params = new URLSearchParams();
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.size) params.set("size", query.size);
  if (query.color) params.set("color", query.color);
  if (query.min !== undefined) params.set("min", String(query.min));
  if (query.max !== undefined) params.set("max", String(query.max));
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function priceRangeLabel(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${formatPrice(min * 100)} to ${formatPrice(max * 100)}`;
  if (max !== undefined) return `Under ${formatPrice(max * 100)}`;
  if (min !== undefined) return `Over ${formatPrice(min * 100)}`;
  return "";
}

export function hasActiveFilters(query: ShopQuery): boolean {
  return Boolean(query.size || query.color || query.min !== undefined || query.max !== undefined);
}

export function countActiveFilters(query: ShopQuery): number {
  return (
    (query.size ? 1 : 0) +
    (query.color ? 1 : 0) +
    (query.min !== undefined || query.max !== undefined ? 1 : 0)
  );
}
