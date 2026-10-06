import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/user";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminContext = {
  user: User;
  displayName: string;
};

/** Reads the signed-in user's role from `profiles` (RLS lets users read their own row). */
const getRole = cache(async (userId: string) => {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("role, full_name").eq("id", userId).maybeSingle();
  return data;
});

/**
 * The real admin check. Call it at the top of every admin page and every admin data function:
 * layouts and pages render in parallel, so a check in the layout alone does not protect a page.
 * Signed-out visitors go to the admin login; signed-in non-admins go there with a notice.
 */
export const requireAdmin = cache(async (): Promise<AdminContext> => {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const profile = await getRole(user.id);
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { user, displayName: profile.full_name?.trim() || user.email || "Admin" };
});

/** Service-role client, handed out only after the admin check passes. */
export async function getAdminDb() {
  await requireAdmin();
  return createAdminSupabaseClient();
}

/** For the login page: is the current visitor already an admin? */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return (await getRole(user.id))?.role === "admin";
}
