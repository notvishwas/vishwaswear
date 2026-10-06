"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True when a Supabase session cookie is present, so the header can offer "Your account" over "Sign in". */
function hasSessionCookie(): boolean {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith("sb-") && cookie.includes("-auth-token"));
}

/**
 * Whether the visitor looks signed in, for display only (header icon and menu link). It reads the
 * session cookie rather than loading the Supabase client, which keeps every page's JavaScript small and
 * public pages cacheable. It proves nothing about identity: /account and the admin check the user on
 * the server. `undefined` until the browser has been read, so the server HTML and first paint match.
 */
export function useHasSession(): boolean | undefined {
  return useSyncExternalStore<boolean | undefined>(noopSubscribe, hasSessionCookie, () => undefined);
}
