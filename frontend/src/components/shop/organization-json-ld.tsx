import { siteConfig } from "@/config/site";
import { JsonLd } from "./json-ld";

/** Organization structured data for search engines, built entirely from siteConfig. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: new URL("/icon", siteConfig.url).toString(),
        description: siteConfig.description,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: siteConfig.supportEmail,
          areaServed: "IN",
          availableLanguage: ["English"],
        },
        sameAs: siteConfig.social.map((link) => link.href),
      }}
    />
  );
}
