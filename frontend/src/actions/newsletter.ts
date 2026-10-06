"use server";

import { after } from "next/server";
import { z } from "zod";
import { isWithinRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/resend/send";
import { WelcomeEmail } from "@/lib/resend/templates/welcome";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

const subscribeSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }).trim().toLowerCase().max(254),
});

export type SubscribeState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function sendWelcome(subscriberId: string, email: string) {
  const admin = createAdminSupabaseClient();
  const result = await sendEmail({
    to: email,
    subject: `Welcome to ${siteConfig.name}`,
    react: WelcomeEmail(),
    replyTo: siteConfig.supportEmail,
  });
  if (result.ok) {
    await admin.from("subscribers").update({ welcome_email_sent_at: new Date().toISOString() }).eq("id", subscriberId);
  }
}

/** Adds an email to the newsletter list (unique, case-insensitive) and sends a welcome email once. */
export async function subscribeToNewsletter(_previous: SubscribeState, formData: FormData): Promise<SubscribeState> {
  // Hidden honeypot field: real visitors leave it empty. Bots that fill it get a silent success.
  if (String(formData.get("company") ?? "") !== "") {
    return { status: "success", message: "Thank you for subscribing." };
  }

  const parsed = subscribeSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  if (!(await isWithinRateLimit({ scope: "newsletter", limit: 5, windowSeconds: 3600 }))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE };
  }

  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("subscribers")
      .insert({ email: parsed.data.email })
      .select("id")
      .single();

    if (error) {
      // 23505 = already subscribed (unique index on lower(email)). Same friendly answer, no new email.
      if (error.code === "23505") {
        return { status: "success", message: "You're already on the list. Thank you!" };
      }
      throw new Error(error.message);
    }

    after(() => sendWelcome(data.id, parsed.data.email));
    return { status: "success", message: "You're on the list. Check your inbox for a welcome note." };
  } catch (error) {
    console.error("[newsletter] subscribe failed", error);
    return { status: "error", message: "We couldn't sign you up just now. Please try again in a moment." };
  }
}
