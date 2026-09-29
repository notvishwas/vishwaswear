import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";
import { getPublicSupabaseEnv } from "./env";

/** Supabase client for Client Components. Subject to RLS as the signed-in user. */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
