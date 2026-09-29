"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * While a payment is still being confirmed (for example the webhook hasn't landed yet), re-fetch the
 * page every few seconds, up to about a minute, so the status updates without a manual reload.
 */
export function PendingRefresh() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 12) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [router]);

  return null;
}
