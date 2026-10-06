"use server";

import { z } from "zod";
import { siteConfig } from "@/config/site";
import { CONTACT_TOPICS } from "@/lib/contact/topics";
import { sendEmail } from "@/lib/resend/send";
import { ContactMessageEmail } from "@/lib/resend/templates/contact-message";
import { isWithinRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/security/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter your name" }).max(100, { error: "Keep this under 100 characters" }),
  email: z.email({ error: "Enter a valid email address" }).trim().toLowerCase().max(254),
  topic: z.enum(CONTACT_TOPICS, { error: "Choose a topic" }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Tell us a little more (at least 10 characters)" })
    .max(3000, { error: "Keep this under 3000 characters" }),
});

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string>; values: Record<string, string> };

/** Sends a message from the contact form to the support inbox through Resend. */
export async function sendContactMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Hidden honeypot field: people leave it empty, simple bots fill it in. Pretend it worked.
  if (String(formData.get("company") ?? "") !== "") return { status: "success" };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  if (!(await isWithinRateLimit({ scope: "contact", limit: 5, windowSeconds: 3600 }))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE, values };
  }

  const inbox = process.env.SUPPORT_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.supportEmail;
  const result = await sendEmail({
    to: inbox,
    subject: `[${siteConfig.name}] ${parsed.data.topic} from ${parsed.data.name}`,
    react: ContactMessageEmail(parsed.data),
    replyTo: parsed.data.email,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: `We couldn't send your message just now. Please email us directly at ${siteConfig.supportEmail}.`,
      values,
    };
  }
  return { status: "success" };
}
