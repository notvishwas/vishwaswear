import { z } from "zod";

const publicEnvSchema = z.object({
  url: z.url({ error: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  anonKey: z.string().min(1, { error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" }),
});

/**
 * Public Supabase settings. The variables are referenced literally so Next.js
 * can inline them into the browser bundle.
 */
export function getPublicSupabaseEnv() {
  return publicEnvSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
