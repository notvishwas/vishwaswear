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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemotePatterns(),
    // Local placeholder artwork in public/products is SVG.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
