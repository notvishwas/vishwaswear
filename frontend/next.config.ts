import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Remote image hosts allowed for next/image:
 *  - the Supabase project (Storage bucket `product-images`)
 *  - any hostnames in NEXT_PUBLIC_IMAGE_DOMAINS (comma separated)
 */
function getRemotePatterns(): RemotePattern[] {
  const hostnames = new Set<string>();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hostnames.add(new URL(supabaseUrl).hostname);
    } catch {
      // Invalid URL is reported where the Supabase client is created.
    }
  }

  for (const domain of (process.env.NEXT_PUBLIC_IMAGE_DOMAINS ?? "").split(",")) {
    const hostname = domain.trim();
    if (hostname) hostnames.add(hostname);
  }

  return [...hostnames].map((hostname) => ({ protocol: "https", hostname }));
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Content Security Policy. Next.js needs inline scripts for hydration, so 'unsafe-inline' stays for
 * scripts and styles; everything else is locked to this site plus Razorpay and Supabase. There is no
 * form-action rule on purpose: the Google sign-in form redirects to Google, which that rule would block.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.razorpay.com",
  "frame-src https://*.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: getRemotePatterns(),
    formats: ["image/avif", "image/webp"],
    // Local placeholder artwork in public/products is SVG.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
