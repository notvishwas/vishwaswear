import Link from "next/link";
import type { ReactNode } from "react";
import { Pagination } from "@/components/shop/pagination";
import { buildTableHref, type TableQuery } from "@/lib/admin/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export type Column<Row> = {
  key: string;
  header: string;
  /** Sortable columns use `key` as the sort key, so it must match a key the page accepts. */
  sortable?: boolean;
  align?: "left" | "right";
  cell: (row: Row) => ReactNode;
};

/** URL-driven table state: search, sort and pagination all live in the query string. */
export type TableControls<SortKey extends string> = {
  basePath: string;
  query: TableQuery<SortKey>;
  total: number;
  totalPages: number;
  pageSize: number;
  searchPlaceholder?: string;
  /** Other params to keep when searching, sorting or paging, such as a status filter. */
  extraParams?: Record<string, string | undefined>;
};

type DataTableProps<Row, SortKey extends string> = {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  emptyTitle: string;
  emptyDescription?: string;
  /** Omit for a plain list (no search, sorting or pagination), such as "recent orders". */
  controls?: TableControls<SortKey>;
};

function SortHeader<SortKey extends string>({
  column,
  controls,
}: {
  column: Column<unknown>;
  controls: TableControls<SortKey>;
}) {
  const { query, basePath, extraParams } = controls;
  const active = query.sort === column.key;
  const nextDir = active && query.dir === "asc" ? "desc" : "asc";
  const href = buildTableHref(basePath, { q: query.q, sort: column.key, dir: nextDir }, extraParams);

  return (
    <Link href={href} className="inline-flex items-center gap-1 hover:text-navy-800">
      {column.header}
      <span aria-hidden="true" className={active ? "text-gold-700" : "text-navy-200"}>
        {active ? (query.dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </Link>
  );
}

export function DataTable<Row, SortKey extends string = string>({
  caption,
  columns,
  rows,
  rowKey,
  emptyTitle,
  emptyDescription,
  controls,
}: DataTableProps<Row, SortKey>) {
  const searching = Boolean(controls?.query.q);

  return (
    <div className="flex flex-col gap-4">
      {controls && (
        <form method="get" action={controls.basePath} role="search" className="flex gap-2">
          {Object.entries(controls.extraParams ?? {}).map(([name, value]) =>
            value ? <input key={name} type="hidden" name={name} value={value} /> : null,
          )}
          <input type="hidden" name="sort" value={controls.query.sort} />
          <input type="hidden" name="dir" value={controls.query.dir} />
          <label htmlFor="table-search" className="sr-only">
            Search {caption}
          </label>
          <input
            id="table-search"
            name="q"
            type="search"
            defaultValue={controls.query.q}
            placeholder={controls.searchPlaceholder ?? "Search"}
            className="h-10 w-full max-w-sm rounded-md border border-navy-200 bg-white px-3 text-sm focus-visible:border-gold-500"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-navy-800 px-4 text-sm font-semibold text-white hover:bg-navy-700"
          >
            Search
          </button>
          {searching && (
            <Link
              href={buildTableHref(controls.basePath, { sort: controls.query.sort, dir: controls.query.dir }, controls.extraParams)}
              className="inline-flex h-10 items-center px-2 text-sm font-medium text-navy-600 underline underline-offset-4"
            >
              Clear
            </Link>
          )}
        </form>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title={searching ? "No results for that search" : emptyTitle}
          description={searching ? "Try a different search term." : emptyDescription}
        />
      ) : (
        <>
          {/* Tablet and desktop: a real table, scrolling sideways if it must. */}
          <div className="hidden overflow-x-auto rounded-md border border-cream-300 bg-white md:block">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead className="bg-cream-200 text-xs uppercase tracking-wider text-navy-500">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        controls && column.sortable && controls.query.sort === column.key
                          ? controls.query.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      className={cn("px-4 py-3 font-semibold", column.align === "right" && "text-right")}
                    >
                      {controls && column.sortable ? (
                        <SortHeader column={column as Column<unknown>} controls={controls} />
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowKey(row)} className="border-t border-cream-300 hover:bg-cream-100">
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3 text-navy-800", column.align === "right" && "text-right")}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: one card per row, with the column headers as labels. */}
          <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
            {rows.map((row) => (
              <li key={rowKey(row)} className="rounded-md border border-cream-300 bg-white p-4">
                <dl className="flex flex-col gap-2 text-sm">
                  {columns.map((column, index) => (
                    <div key={column.key} className={cn("flex justify-between gap-4", index === 0 && "font-semibold")}>
                      <dt className="text-navy-400">{column.header}</dt>
                      <dd className="text-right text-navy-800">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      {controls && controls.total > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-navy-400">
            Showing {(controls.query.page - 1) * controls.pageSize + 1}–
            {Math.min(controls.query.page * controls.pageSize, controls.total)} of {controls.total}
          </p>
          <Pagination
            page={controls.query.page}
            totalPages={controls.totalPages}
            hrefFor={(page) =>
              buildTableHref(controls.basePath, { q: controls.query.q, sort: controls.query.sort, dir: controls.query.dir, page }, controls.extraParams)
            }
          />
        </div>
      )}
    </div>
  );
}
