import "server-only";
import { z } from "zod";

const razorpayEnvSchema = z.object({
  keyId: z.string().min(1, { error: "NEXT_PUBLIC_RAZORPAY_KEY_ID is required" }),
  keySecret: z.string().min(1, { error: "RAZORPAY_KEY_SECRET is required" }),
});

const webhookSecretSchema = z.string().min(1, { error: "RAZORPAY_WEBHOOK_SECRET is required" });

export function getRazorpayEnv() {
  return razorpayEnvSchema.parse({
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export function getRazorpayWebhookSecret() {
  return webhookSecretSchema.parse(process.env.RAZORPAY_WEBHOOK_SECRET);
}
