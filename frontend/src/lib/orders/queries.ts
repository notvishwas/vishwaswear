import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types";

export type OrderWithItems = Order & { items: OrderItem[] };

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
};

/** Narrows the jsonb address column, tolerating missing optional fields. */
export function parseShippingAddress(value: Order["shipping_address"]): ShippingAddress {
  const record = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
  const text = (key: string) => (typeof record[key] === "string" ? (record[key] as string) : "");
  return {
    fullName: text("fullName"),
    line1: text("line1"),
    line2: text("line2") || null,
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    landmark: text("landmark") || null,
  };
}

/** Loads an order and its items by order number. Server-only; uses the service role. */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return data;
}

/** "ORD-100001", "ord-100001" and "100001" all resolve to "ORD-100001". */
export function normalizeOrderNumber(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  return /^\d+$/.test(cleaned) ? `ORD-${cleaned}` : cleaned;
}

/** A signed-in user's orders, newest first. Unpaid checkouts are left out. */
export async function getOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .neq("status", "pending_payment")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return data;
}
