import { NextResponse } from "next/server";
import { z } from "zod";
import { recordPaymentFailure, settleOrderPayment } from "@/lib/razorpay/settle";
import { verifyWebhookSignature } from "@/lib/razorpay/signature";

const webhookSchema = z.object({
  event: z.string(),
  payload: z
    .object({
      payment: z
        .object({
          entity: z.object({
            id: z.string().min(1),
            order_id: z.string().nullish(),
            amount: z.number().int(),
            error_description: z.string().nullish(),
          }),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Razorpay webhook. Marks orders paid even when the customer closed the browser after paying.
 * Idempotent: repeated deliveries and the browser verify step all funnel into one Postgres function.
 * Non-2xx responses make Razorpay retry, so only transient failures return 5xx.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("[webhook] signature check failed", error);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let body: z.infer<typeof webhookSchema>;
  try {
    body = webhookSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const payment = body.payload?.payment?.entity;
  if (!payment?.order_id) {
    // Not a payment tied to one of our orders, or an event we don't act on.
    return NextResponse.json({ received: true });
  }

  try {
    if (body.event === "payment.captured") {
      const result = await settleOrderPayment({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        amountPaise: payment.amount,
      });
      if (result === "insufficient_stock" || result === "amount_mismatch" || result === "invalid_state") {
        // Retrying cannot fix these, so acknowledge and leave it for a human.
        console.error("[webhook] captured payment needs attention", { orderId: payment.order_id, result });
      }
      return NextResponse.json({ received: true, result });
    }

    if (body.event === "payment.failed") {
      await recordPaymentFailure(payment.order_id, payment.error_description ?? "Payment failed");
      return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("[webhook] processing failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
