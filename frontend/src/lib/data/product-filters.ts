import { z } from "zod";

export const PRODUCT_SORTS = ["newest", "price-asc", "price-desc", "featured"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const productFiltersSchema = z.object({
  category: z.string().min(1).optional(),
  search: z.string().trim().min(1).max(80).optional(),
  /** Paise. */
  minPrice: z.number().int().nonnegative().optional(),
  /** Paise. */
  maxPrice: z.number().int().nonnegative().optional(),
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  featured: z.boolean().optional(),
  sort: z.enum(PRODUCT_SORTS).default("newest"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(60).default(12),
});

export type ProductFiltersInput = z.input<typeof productFiltersSchema>;
export type ProductFilters = z.output<typeof productFiltersSchema>;
