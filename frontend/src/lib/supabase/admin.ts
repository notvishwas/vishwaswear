import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types";
import { getPublicSupabaseEnv } from "./env";

const serviceRoleKeySchema = z.string().min(1, { error: "SUPABASE_SERVICE_ROLE_KEY is required" });

/**
 * Service-role client. Bypasses RLS, so use it only in trusted server code
 * (order creation, webhooks, admin mutations after an explicit admin check).
 */
export function createAdminSupabaseClient() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = serviceRoleKeySchema.parse(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
