import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Attaches earlier guest orders to a user who signs in with the same, verified email address.
 * Checkout stores emails in lowercase, so an exact match is enough (and safe from LIKE wildcards).
 */
export async function claimGuestOrders(user: User): Promise<void> {
  const metadata = user.user_metadata as Record<string, unknown>;
  const verified = Boolean(user.email_confirmed_at) || metadata.email_verified === true;
  if (!user.email || !verified) return;

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("orders")
    .update({ user_id: user.id })
    .eq("email", user.email.toLowerCase())
    .is("user_id", null);

  if (error) console.error("[auth] Failed to link guest orders", error.message);
}
