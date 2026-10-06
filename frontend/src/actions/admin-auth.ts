"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isWithinRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/security/rate-limit";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Enter your password" }).max(200),
});

export type AdminLoginState = { status: "idle" } | { status: "error"; message: string; email: string };

/** Email and password sign-in for the admin area. Only accounts with profiles.role = 'admin' get in. */
export async function adminSignIn(_previous: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: String(formData.get("password") ?? "") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your details", email };
  }

  if (!(await isWithinRateLimit({ scope: "admin-login", limit: 10, windowSeconds: 600 }))) {
    return { status: "error", message: RATE_LIMIT_MESSAGE, email };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  // One message for every credential failure, so the form can't be used to discover accounts.
  if (error || !data.user) {
    return { status: "error", message: "That email and password don't match an account.", email };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { status: "error", message: "This account doesn't have admin access.", email };
  }

  redirect("/admin");
}

export async function adminSignOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
