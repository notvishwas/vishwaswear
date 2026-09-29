import "server-only";
import { after } from "next/server";
import { sendOrderPaidEmails } from "@/lib/orders/emails";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type SettleResult =
  | "paid"
  | "already_paid"
  | "insufficient_stock"
  | "amount_mismatch"
  | "invalid_state"
  | "not_found";

const RESULTS: readonly SettleResult[] = [
  "paid",
  "already_paid",
  "insufficient_stock",
  "amount_mismatch",
  "invalid_state",
  "not_found",
];

/**
 * Marks an order paid and decrements stock, atomically in Postgres. Safe to call repeatedly and from
 * both the browser verify step and the webhook: the database function guarantees stock is taken once.
 */
export async function settleOrderPayment(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** When provided (webhook), must equal the order total. */
  amountPaise?: number;
}): Promise<SettleResult> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("mark_order_paid", {
    p_razorpay_order_id: params.razorpayOrderId,
    p_payment_id: params.razorpayPaymentId,
    p_amount_paise: params.amountPaise,
  });

  if (error) throw new Error(`mark_order_paid failed: ${error.message}`);

  const result = RESULTS.find((value) => value === data);
  if (!result) throw new Error(`mark_order_paid returned an unexpected value: ${String(data)}`);
  // Emails run after the response so they can never slow down or break payment handling. The
  // per-email claim in the database keeps them to one send even if this runs several times.
  if (result === "paid" || result === "already_paid") {
    after(() => sendOrderPaidEmails(params.razorpayOrderId));
  }

  return result;
}

/** Records a failed payment attempt on a still-unpaid order. The customer can retry the same order. */
export async function recordPaymentFailure(razorpayOrderId: string, reason: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_issue: `payment_failed: ${reason}`.slice(0, 300) })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("status", "pending_payment");

  if (error) throw new Error(`Failed to record payment failure: ${error.message}`);
}
