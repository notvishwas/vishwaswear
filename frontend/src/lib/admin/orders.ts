import "server-only";
import { getAdminDb } from "@/lib/auth/admin";
import type { Order, OrderEvent, OrderItem, OrderStatus, Paginated } from "@/types";
import { sanitizeSearch, type TableQuery } from "./table";

export const ORDER_SORT_KEYS = ["created_at", "order_number", "status", "total_paise"] as const;
export type OrderSortKey = (typeof ORDER_SORT_KEYS)[number];

export const ORDER_STATUS_FILTERS: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "pending_payment",
];

export type AdminOrderRow = Pick<
  Order,
  "id" | "order_number" | "email" | "phone" | "status" | "total_paise" | "created_at"
>;

const PAGE_SIZE = 15;

export type OrderDetail = Order & { items: OrderItem[]; events: OrderEvent[] };

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!data) return null;
  return { ...data, events: [...data.events].sort((a, b) => a.created_at.localeCompare(b.created_at)) };
}

export async function listOrders(
  query: TableQuery<OrderSortKey>,
  status: OrderStatus | undefined,
): Promise<Paginated<AdminOrderRow>> {
  const db = await getAdminDb();

  let request = db
    .from("orders")
    .select("id, order_number, email, phone, status, total_paise, created_at", { count: "exact" });

  if (status) request = request.eq("status", status);

  const term = sanitizeSearch(query.q);
  if (term) request = request.or(`order_number.ilike.%${term}%,email.ilike.%${term}%`);

  const from = (query.page - 1) * PAGE_SIZE;
  const { data, error, count } = await request
    .order(query.sort, { ascending: query.dir === "asc" })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  // A page past the end: return an empty page; the table shows the real total.
  if (error?.code === "PGRST103") {
    return { items: [], total: 0, page: query.page, pageSize: PAGE_SIZE, totalPages: 0 };
  }
  if (error) throw new Error(`Failed to load orders: ${error.message}`);

  const total = count ?? 0;
  return { items: data, total, page: query.page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}
