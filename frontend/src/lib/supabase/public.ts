import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getPublicSupabaseEnv } from "./env";

/**
 * Cookie-free anonymous client for public catalogue reads. Because it never touches cookies or
 * headers, pages that only use it can be cached and revalidated instead of rendered per request.
 * Row Level Security still applies: it can only see what an anonymous visitor may see.
 */
export function createPublicSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
