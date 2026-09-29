import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types";
import { getPublicSupabaseEnv } from "./env";

/** Cookie-based Supabase client for Server Components, Server Actions and Route Handlers. Subject to RLS. */
export async function createServerSupabaseClient() {
  // Read cookies first so pages using this client always render per request, never at build time.
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore as long as a proxy refreshes the session.
        }
      },
    },
  });
}
