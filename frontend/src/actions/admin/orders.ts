"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { failure, success, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/auth/admin";
import { sendOrderShippedEmail } from "@/lib/orders/emails";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const updateStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(["processing", "shipped", "delivered", "cancelled", "refunded"]),
  courierName: z.string().trim().max(80, { error: "Keep this under 80 characters" }).optional(),
  trackingNumber: z.string().trim().max(80, { error: "Keep this under 80 characters" }).optional(),
  trackingUrl: z.union([z.literal(""), z.url({ error: "Enter a full link starting with https://" }).max(500)]).optional(),
});

export type UpdateOrderStatusInput = z.input<typeof updateStatusSchema>;

const RPC_MESSAGES: Record<string, string> = {
  not_found: "That order no longer exists.",
  invalid_transition: "This order can't move to that status from where it is now. Reload the page to see its current status.",
  courier_required: "Enter the courier name before marking the order as shipped.",
};

/**
 * Moves an order to a new status. The database function enforces the allowed moves, restores stock
 * on cancel or refund inside the same transaction, and records the change on the order timeline.
 * Marking an order shipped also emails the customer (once) with the courier details.
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
    return failure("Please fix the highlighted fields.", fieldErrors);
  }
  const { orderId, status, courierName, trackingNumber, trackingUrl } = parsed.data;

  if (status === "shipped" && !courierName) {
    return failure("Enter the courier name before marking the order as shipped.", { courierName: "Required" });
  }

  const db = createAdminSupabaseClient();
  const { data, error } = await db.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_admin_id: user.id,
    p_courier_name: courierName || undefined,
    p_tracking_number: trackingNumber || undefined,
    p_tracking_url: trackingUrl || undefined,
  });

  if (error) {
    console.error("[admin] updateOrderStatus failed", error);
    return failure("We couldn't update the order. Please try again.");
  }
  if (data !== "ok") return failure(RPC_MESSAGES[data] ?? "We couldn't update the order.");

  if (status === "shipped") {
    after(async () => {
      const { data: order } = await db.from("orders").select("*, items:order_items(*)").eq("id", orderId).maybeSingle();
      if (order) await sendOrderShippedEmail(order);
    });
  }

  revalidatePath("/admin", "layout");

  const messages: Record<string, string> = {
    processing: "Order marked as processing.",
    shipped: "Order marked as shipped. The customer has been emailed.",
    delivered: "Order marked as delivered.",
    cancelled: "Order cancelled and its stock restored.",
    refunded: "Order marked as refunded and its stock restored. Refund the payment in Razorpay too.",
  };
  return success(messages[status]);
}
