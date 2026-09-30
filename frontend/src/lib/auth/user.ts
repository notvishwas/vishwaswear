import "server-only";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * The signed-in user, verified with Supabase, or null. Deduplicated per request. Visitors with no
 * session cookie return immediately without a network call.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  if (!cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-"))) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
});

/** Best display name for a user: Google full name, then the email's local part. */
export function getUserDisplayName(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown>;
  const name = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : "";
  return name.trim() || (user.email?.split("@")[0] ?? "there");
}
