import "server-only";
import { z } from "zod";
import { getAdminDb } from "@/lib/auth/admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/shop/variants";
import type { Order } from "@/types";

const statsSchema = z.object({
  today_orders: z.number().int(),
  month_revenue_paise: z.number().int(),
  total_orders: z.number().int(),
  low_stock_count: z.number().int(),
  top_products: z.array(
    z.object({
      name: z.string(),
      units: z.number().int(),
      revenue_paise: z.number().int(),
    }),
  ),
});

export type DashboardStats = z.infer<typeof statsSchema>;

/** All dashboard numbers, computed in Postgres by `admin_dashboard_stats` (see the migration for definitions). */
export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getAdminDb();
  const { data, error } = await db.rpc("admin_dashboard_stats", { p_low_stock_threshold: LOW_STOCK_THRESHOLD });
  if (error) throw new Error(`Failed to load dashboard stats: ${error.message}`);
  return statsSchema.parse(data);
}

export type RecentOrder = Pick<Order, "id" | "order_number" | "email" | "status" | "total_paise" | "created_at">;

/** The latest orders, newest first. Abandoned checkouts (pending_payment) are left out. */
export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  const db = await getAdminDb();
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, email, status, total_paise, created_at")
    .neq("status", "pending_payment")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load recent orders: ${error.message}`);
  return data;
}
