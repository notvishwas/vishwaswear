import { z } from "zod";
import { INDIAN_STATES } from "./indian-states";

const phoneMessage = "Enter a valid 10-digit Indian mobile number";

/** The 10 digits of an Indian mobile number, dropping any +91, 91 or 0 prefix. */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(-10);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Keep this under ${max} characters` })
    .optional()
    .transform((value) => value || undefined);

/** Form fields shared by the checkout form and the server action. */
export const checkoutFormSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }).trim().toLowerCase().max(254),
  phone: z
    .string()
    .trim()
    .refine((value) => /^(?:\+91|91|0)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, "")), { error: phoneMessage }),
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Enter your full name" })
    .max(100, { error: "Keep this under 100 characters" }),
  addressLine1: z
    .string()
    .trim()
    .min(5, { error: "Enter your street address" })
    .max(150, { error: "Keep this under 150 characters" }),
  addressLine2: optionalText(150),
  city: z.string().trim().min(2, { error: "Enter your city" }).max(80, { error: "Keep this under 80 characters" }),
  state: z.enum(INDIAN_STATES, { error: "Select your state" }),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, { error: "Enter a valid 6-digit PIN code" }),
  landmark: optionalText(100),
});

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormValues = z.output<typeof checkoutFormSchema>;
