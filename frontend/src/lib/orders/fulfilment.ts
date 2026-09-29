import "server-only";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendOrderShippedEmail } from "./emails";
import { getOrderByNumber } from "./queries";

const shipmentSchema = z.object({
  courierName: z.string().trim().min(2).max(80),
  trackingNumber: z.string().trim().max(80).optional(),
  trackingUrl: z.url().max(500).optional(),
});

export type ShipmentInput = z.input<typeof shipmentSchema>;

/**
 * Marks a paid order as shipped, stores the courier details and emails the customer once.
 * Server-only: call it from an admin-checked action or route (the admin panel comes later).
 */
export async function markOrderShipped(
  orderNumber: string,
  input: ShipmentInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = shipmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Courier details are invalid." };

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("orders")
    .update({
      status: "shipped",
      courier_name: parsed.data.courierName,
      tracking_number: parsed.data.trackingNumber ?? null,
      tracking_url: parsed.data.trackingUrl ?? null,
      shipped_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .in("status", ["paid", "processing"])
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (data.length === 0) return { ok: false, error: "Order not found or not ready to ship." };

  const order = await getOrderByNumber(orderNumber);
  if (order) await sendOrderShippedEmail(order);
  return { ok: true };
}
