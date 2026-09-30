import { NextResponse } from "next/server";
import { claimGuestOrders } from "@/lib/auth/claim-orders";
import { safeNextPath } from "@/lib/auth/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getOrigin(request: Request): string {
  // Behind a proxy or CDN the request URL can carry an internal host; prefer the forwarded one.
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) return `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`;
  return new URL(request.url).origin;
}

/** Google sends the shopper back here with a one-time code, which we exchange for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getOrigin(request);
  const next = safeNextPath(url.searchParams.get("next"));

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/login?error=denied`);
  }

  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("[auth] Code exchange failed", error?.message);
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  try {
    await claimGuestOrders(data.user);
  } catch (claimError) {
    // Linking old orders is a nicety; it must never block signing in.
    console.error("[auth] claimGuestOrders failed", claimError);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
