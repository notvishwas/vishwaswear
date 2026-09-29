import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const secretSchema = z.string().min(16, { error: "ORDER_TOKEN_SECRET must be set (16+ characters)" });

function sign(value: string): string {
  const secret = secretSchema.parse(process.env.ORDER_TOKEN_SECRET);
  return createHmac("sha256", secret).update(value).digest("base64url");
}

/** Unguessable access token for one order, so order numbers alone can't be used to view an order. */
export function createOrderToken(orderNumber: string): string {
  return sign(`order:${orderNumber}`);
}

export function verifyOrderToken(orderNumber: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(createOrderToken(orderNumber));
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Path (with token) to the confirmation page for an order. */
export function getConfirmationPath(orderNumber: string): string {
  return `/order/${encodeURIComponent(orderNumber)}/confirmation?token=${createOrderToken(orderNumber)}`;
}
