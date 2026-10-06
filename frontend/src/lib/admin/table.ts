import { z } from "zod";

export type SortDirection = "asc" | "desc";

export type TableQuery<SortKey extends string> = {
  q: string;
  sort: SortKey;
  dir: SortDirection;
  page: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads the shared table state (`q`, `sort`, `dir`, `page`) from the URL. Unknown sort keys and bad
 * numbers fall back to the defaults, so a hand-edited URL can never break a page.
 */
export function parseTableQuery<SortKey extends string>(
  raw: RawSearchParams,
  options: { sortKeys: readonly [SortKey, ...SortKey[]]; defaultSort: SortKey; defaultDir?: SortDirection },
): TableQuery<SortKey> {
  const schema = z.object({
    q: z.string().trim().max(80).catch(""),
    sort: z.enum(options.sortKeys).catch(options.defaultSort),
    dir: z.enum(["asc", "desc"]).catch(options.defaultDir ?? "desc"),
    page: z.coerce.number().int().min(1).max(10_000).catch(1),
  });

  return schema.parse({
    q: first(raw.q) ?? "",
    sort: first(raw.sort),
    dir: first(raw.dir),
    page: first(raw.page),
  });
}

/** Builds a table URL, keeping any extra params (such as a status filter) and dropping defaults. */
export function buildTableHref(
  basePath: string,
  query: Partial<TableQuery<string>>,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  if (query.dir) params.set("dir", query.dir);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Strips characters that have meaning inside PostgREST filters and LIKE patterns. */
export function sanitizeSearch(value: string): string {
  return value.replace(/[%_,()*\\]/g, " ").trim();
}
