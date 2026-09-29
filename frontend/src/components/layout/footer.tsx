import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { buildNavLinks } from "./nav-links";
import { loadNavCategories } from "./load-categories";
import { SiteLogo } from "./site-logo";

const careLinks = [
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Size guide", href: "/size-guide" },
  { label: "Contact", href: "/contact" },
];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-navy-100 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const shopLinks = buildNavLinks(await loadNavCategories()).map((link) =>
    link.href === "/shop" ? { ...link, label: "All products" } : link,
  );

  return (
    <footer className="mt-auto bg-navy-800 text-navy-100">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">
              {siteConfig.description}
            </p>
          </div>

          <LinkColumn title="Shop" links={shopLinks} />
          <LinkColumn title="Customer care" links={careLinks} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Connect</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href={`mailto:${siteConfig.supportEmail}`} className="text-sm text-navy-100 hover:text-white">
                  {siteConfig.supportEmail}
                </a>
              </li>
              {siteConfig.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-navy-100 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-500 pt-6 text-xs text-navy-300">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
