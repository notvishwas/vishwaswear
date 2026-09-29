import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { getEmailEnv } from "./env";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

/**
 * Sends a transactional email through Resend. Never throws: failures are logged and returned so an
 * email problem can't break an order, a payment or a signup.
 */
export async function sendEmail({ to, subject, react, replyTo }: SendEmailParams): Promise<SendEmailResult> {
  const { apiKey, from } = getEmailEnv();

  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY or EMAIL_FROM is not set; skipping email", { subject });
    return { ok: false, error: "Email is not configured", skipped: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({ from, to, subject, react, replyTo });

    if (error || !data) {
      console.error("[email] Resend rejected the email", { subject, error });
      return { ok: false, error: error?.message ?? "Unknown Resend error" };
    }
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("[email] Sending failed", { subject, error });
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
