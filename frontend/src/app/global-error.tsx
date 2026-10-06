"use client";

import { Manrope } from "next/font/google";
import { useEffect } from "react";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

/** Last-resort error page, shown when the root layout itself fails. Replaces the whole document. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        className={manrope.className}
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
          background: "#faf7f2",
          color: "#0f1b2d",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "26rem", color: "#52627d", lineHeight: 1.6 }}>
          We hit an unexpected problem. Please try again, and if it keeps happening, contact us.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1rem",
            height: "2.75rem",
            padding: "0 1.5rem",
            border: "1px solid #0f1b2d",
            borderRadius: "4px",
            background: "#0f1b2d",
            color: "#ffffff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
