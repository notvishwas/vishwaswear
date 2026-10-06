import "server-only";
import { headers } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type RateLimitOptions = {
  /** Which endpoint is being limited, e.g. "contact". */
  scope: string;
  limit: number;
  windowSeconds: number;
};

/** Best-effort client address from the proxy headers, used only to key rate limits. */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip") || "unknown";
}

/**
 * Returns true when the caller is within the limit. If the limiter itself fails (database down), it
 * lets the request through and logs, so a rate-limit problem never blocks a real customer.
 */
export async function isWithinRateLimit({ scope, limit, windowSeconds }: RateLimitOptions): Promise<boolean> {
  try {
    const ip = await getClientIp();
    const { data, error } = await createAdminSupabaseClient().rpc("check_rate_limit", {
      p_key: `${scope}:${ip}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] check failed", error.message);
      return true;
    }
    return data;
  } catch (error) {
    console.error("[rate-limit] check threw", error);
    return true;
  }
}

export const RATE_LIMIT_MESSAGE = "You're doing that a little too quickly. Please wait a few minutes and try again.";
