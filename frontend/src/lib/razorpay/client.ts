import "server-only";
import { z } from "zod";
import { getRazorpayEnv } from "./env";

const razorpayOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
});

export type RazorpayOrder = z.infer<typeof razorpayOrderSchema>;

/** Creates a Razorpay order. `amountPaise` is an integer number of paise. */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getRazorpayEnv();

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed with status ${response.status}`);
  }
  return razorpayOrderSchema.parse(await response.json());
}
