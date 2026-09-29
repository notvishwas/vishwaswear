"use server";

import { z } from "zod";
import { calculateShipping } from "@/config/shipping";
import { validateCartItems } from "@/lib/cart/validate";
import { checkoutFormSchema, normalizePhone } from "@/lib/checkout/schema";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { getRazorpayEnv } from "@/lib/razorpay/env";
import { settleOrderPayment } from "@/lib/razorpay/settle";
import { verifyCheckoutSignature } from "@/lib/razorpay/signature";
import { getConfirmationPath } from "@/lib/orders/token";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ValidatedCart } from "@/types/cart";

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];

const createOrderSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        variantId: z.uuid(),
        quantity: z.number().int().min(1).max(999),
        unitPricePaise: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(50),
  /** Identifies one checkout attempt so repeated submits reuse the same order. */
  idempotencyKey: z.string().min(16).max(200),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;

export type CreateOrderResult =
  | {
      ok: true;
      kind: "pay";
      orderNumber: string;
      razorpayOrderId: string;
      amountPaise: number;
      currency: "INR";
      keyId: string;
    }
  | { ok: true; kind: "already_paid"; orderNumber: string; confirmationPath: string }
  | {
      ok: false;
      code: "invalid_input" | "empty_cart" | "cart_changed" | "payment_setup_failed" | "server_error";
      message: string;
      /** Present for cart_changed so the client can apply the server's corrections. */
      validated?: Extract<ValidatedCart, { ok: true }>;
    };

type ExistingOrder = {
  id: string;
  order_number: string;
  status: string;
  total_paise: number;
  razorpay_order_id: string | null;
};

function fail(code: Extract<CreateOrderResult, { ok: false }>["code"], message: string): CreateOrderResult {
  return { ok: false, code, message };
}

/**
 * Creates (or reuses) a pending order for the cart and a matching Razorpay order.
 * Prices, stock and totals all come from the database, never from the client.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input", "Please check your details and try again.");
  const { items, idempotencyKey, ...form } = parsed.data;

  try {
    const validated = await validateCartItems(items);
    if (!validated.ok) return fail("server_error", validated.error);
    if (validated.lines.length === 0) return fail("empty_cart", "Your cart is empty.");
    if (validated.warnings.length > 0) {
      return {
        ok: false,
        code: "cart_changed",
        message: "Some items in your cart changed. Please review your cart before paying.",
        validated,
      };
    }

    const subtotalPaise = validated.lines.reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0);
    const shippingPaise = calculateShipping(subtotalPaise);
    const totalPaise = subtotalPaise + shippingPaise;

    const admin = createAdminSupabaseClient();

    const contactFields = {
      email: form.email,
      phone: normalizePhone(form.phone),
      shipping_address: {
        fullName: form.fullName,
        line1: form.addressLine1,
        line2: form.addressLine2 ?? null,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        landmark: form.landmark ?? null,
      },
    };

    const findExisting = async (): Promise<ExistingOrder | null> => {
      const { data, error } = await admin
        .from("orders")
        .select("id, order_number, status, total_paise, razorpay_order_id")
        .eq("idempotency_key", idempotencyKey)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`Order lookup failed: ${error.message}`);
      return data;
    };

    const respondWithExisting = async (existing: ExistingOrder): Promise<CreateOrderResult> => {
      if (PAID_STATUSES.includes(existing.status)) {
        return {
          ok: true,
          kind: "already_paid",
          orderNumber: existing.order_number,
          confirmationPath: getConfirmationPath(existing.order_number),
        };
      }
      const razorpayOrderId = await ensureRazorpayOrder(existing);
      return {
        ok: true,
        kind: "pay",
        orderNumber: existing.order_number,
        razorpayOrderId,
        amountPaise: existing.total_paise,
        currency: "INR",
        keyId: getRazorpayEnv().keyId,
      };
    };

    const ensureRazorpayOrder = async (order: ExistingOrder): Promise<string> => {
      if (order.razorpay_order_id) return order.razorpay_order_id;
      const razorpayOrder = await createRazorpayOrder({
        amountPaise: order.total_paise,
        receipt: order.order_number,
        notes: { order_number: order.order_number },
      });
      const { error } = await admin
        .from("orders")
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq("id", order.id);
      if (error) throw new Error(`Failed to store Razorpay order id: ${error.message}`);
      return razorpayOrder.id;
    };

    // Same checkout attempt submitted again (double click, retry, reload): reuse its order.
    const existing = await findExisting();
    if (existing) {
      if (PAID_STATUSES.includes(existing.status)) return respondWithExisting(existing);
      if (existing.status === "pending_payment") {
        if (existing.total_paise === totalPaise) {
          // The shopper may have corrected their details since the last attempt.
          await admin.from("orders").update(contactFields).eq("id", existing.id);
          return respondWithExisting(existing);
        }
        // The cart's value changed since that order was made; retire it and start a fresh one.
        await admin.from("orders").update({ status: "cancelled" }).eq("id", existing.id);
      }
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        ...contactFields,
        status: "pending_payment",
        subtotal_paise: subtotalPaise,
        shipping_paise: shippingPaise,
        total_paise: totalPaise,
        idempotency_key: idempotencyKey,
      })
      .select("id, order_number, status, total_paise, razorpay_order_id")
      .single();

    if (orderError) {
      // Two concurrent submits raced on the open-order unique index: use the winner.
      if (orderError.code === "23505") {
        const winner = await findExisting();
        if (winner) return respondWithExisting(winner);
      }
      throw new Error(`Order insert failed: ${orderError.message}`);
    }

    const { error: itemsError } = await admin.from("order_items").insert(
      validated.lines.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        variant_id: line.variantId,
        product_name: line.name,
        size: line.size,
        color: line.color,
        unit_price_paise: line.unitPricePaise,
        quantity: line.quantity,
        image_url: line.image,
      })),
    );
    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id);
      throw new Error(`Order items insert failed: ${itemsError.message}`);
    }

    try {
      return await respondWithExisting(order);
    } catch (error) {
      await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      console.error("[checkout] Razorpay order creation failed", error);
      return fail("payment_setup_failed", "We couldn't start the payment. Please try again in a moment.");
    }
  } catch (error) {
    console.error("[checkout] createOrder failed", error);
    return fail("server_error", "Something went wrong on our side. Your cart is safe, please try again.");
  }
}

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().min(1).max(200),
});

export type VerifyPaymentResult =
  | { ok: true; orderNumber: string; confirmationPath: string }
  | { ok: false; code: "invalid_signature" | "insufficient_stock" | "server_error"; message: string };

/**
 * Verifies the signature Razorpay Checkout returns, then marks the order paid and takes stock.
 * The webhook does the same independently, so whichever arrives first wins and the other is a no-op.
 */
export async function verifyPayment(input: z.input<typeof verifyPaymentSchema>): Promise<VerifyPaymentResult> {
  const parsed = verifyPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_signature", message: "We couldn't verify this payment." };
  }
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  try {
    const valid = verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature: razorpaySignature });
    if (!valid) {
      console.error("[checkout] invalid checkout signature", { razorpayOrderId });
      return { ok: false, code: "invalid_signature", message: "We couldn't verify this payment." };
    }

    const result = await settleOrderPayment({ razorpayOrderId, razorpayPaymentId });

    if (result === "insufficient_stock") {
      console.error("[checkout] payment received but stock ran out; needs manual refund", { razorpayOrderId });
      return {
        ok: false,
        code: "insufficient_stock",
        message:
          "Your payment went through, but an item sold out while you were paying. We will refund you in full and email you shortly.",
      };
    }
    if (result !== "paid" && result !== "already_paid") {
      console.error("[checkout] unexpected settle result", { razorpayOrderId, result });
      return {
        ok: false,
        code: "server_error",
        message: "We received your payment but couldn't confirm the order yet. Please don't pay again; we'll email you.",
      };
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("orders")
      .select("order_number")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();
    if (error) throw new Error(`Order lookup failed: ${error.message}`);

    return { ok: true, orderNumber: data.order_number, confirmationPath: getConfirmationPath(data.order_number) };
  } catch (error) {
    console.error("[checkout] verifyPayment failed", error);
    return {
      ok: false,
      code: "server_error",
      message: "We couldn't confirm your payment just now. If money was deducted, don't pay again: the order will be confirmed automatically.",
    };
  }
}
