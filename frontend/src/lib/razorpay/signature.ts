import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getRazorpayEnv, getRazorpayWebhookSecret } from "./env";

function hmacHex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

function safeEqualHex(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checkout signature: HMAC-SHA256 of `order_id|payment_id` with the key secret. */
export function verifyCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayEnv();
  const expected = hmacHex(keySecret, `${params.razorpayOrderId}|${params.razorpayPaymentId}`);
  return safeEqualHex(expected, params.signature);
}

/** Webhook signature: HMAC-SHA256 of the raw request body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = hmacHex(getRazorpayWebhookSecret(), rawBody);
  return safeEqualHex(expected, signature);
}
