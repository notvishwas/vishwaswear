import "server-only";
import { z } from "zod";
import { getAdminDb } from "@/lib/auth/admin";
import type { Paginated } from "@/types";
import { sanitizeSearch, type TableQuery } from "./table";

export const CUSTOMER_SORT_KEYS = ["last_order_at", "name", "email", "order_count", "total_spent_paise"] as const;
export type CustomerSortKey = (typeof CUSTOMER_SORT_KEYS)[number];

const customersSchema = z.object({
  total: z.number().int(),
  rows: z.array(
    z.object({
      email: z.string(),
      name: z.string().nullable(),
      order_count: z.number().int(),
      total_spent_paise: z.number().int(),
      last_order_at: z.string(),
    }),
  ),
});

export type AdminCustomerRow = z.infer<typeof customersSchema>["rows"][number];

const PAGE_SIZE = 15;

/** Customers derived from paid orders, grouped by email. See `admin_list_customers` in the migration. */
export async function listCustomers(query: TableQuery<CustomerSortKey>): Promise<Paginated<AdminCustomerRow>> {
  const db = await getAdminDb();
  const { data, error } = await db.rpc("admin_list_customers", {
    p_search: sanitizeSearch(query.q),
    p_sort: query.sort,
    p_dir: query.dir,
    p_limit: PAGE_SIZE,
    p_offset: (query.page - 1) * PAGE_SIZE,
  });
  if (error) throw new Error(`Failed to load customers: ${error.message}`);

  const parsed = customersSchema.parse(data);
  return {
    items: parsed.rows,
    total: parsed.total,
    page: query.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(parsed.total / PAGE_SIZE),
  };
}
