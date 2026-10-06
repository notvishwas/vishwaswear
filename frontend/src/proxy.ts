import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

/**
 * Keeps the Supabase auth session fresh. Access tokens are short lived; this refreshes them and
 * writes the new cookies before pages render. Visitors without a session cookie skip all of it.
 */
export async function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  const { pathname } = request.nextUrl;

  // First gate for the admin area: no session means no admin. The role itself is checked on the
  // server by requireAdmin(), because a cookie alone proves nothing about who someone is.
  const isProtectedAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!hasSession) {
    return isProtectedAdminRoute
      ? NextResponse.redirect(new URL("/admin/login", request.url))
      : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getPublicSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Validates the token with Supabase and triggers a refresh when needed.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|products/|api/webhooks/).*)"],
};
