export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Vishwaswear",
  description:
    "Tailored suits, blazers, coats, trousers and shirts for the modern Indian man.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://vishwaswear.com",
  currency: "INR",
  locale: "en-IN",
  // SUPPORT_EMAIL is server-only; client bundles fall back to the default.
  supportEmail: process.env.SUPPORT_EMAIL || "support@vishwaswear.com",
} as const;
