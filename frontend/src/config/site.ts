import { shippingConfig } from "./shipping";

function optionalUrl(value: string | undefined) {
  return value && value.startsWith("http") ? value : undefined;
}

const socialCandidates = [
  { label: "Instagram", href: optionalUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
  { label: "Facebook", href: optionalUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL) },
  { label: "YouTube", href: optionalUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL) },
];

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Vishwaswear",
  description:
    "Tailored suits, blazers, coats, trousers and shirts for the modern Indian man.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://vishwaswear.com",
  currency: "INR",
  locale: "en-IN",
  // SUPPORT_EMAIL is server-only; client bundles fall back to the default.
  supportEmail: process.env.SUPPORT_EMAIL || "support@vishwaswear.com",
  freeShippingThresholdPaise: shippingConfig.freeShippingThresholdPaise,
  returnWindowDays: 15,
  /** Only the social profiles that have a URL configured. */
  social: socialCandidates.filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  ),
} as const;
