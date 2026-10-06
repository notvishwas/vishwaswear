import Link from "next/link";
import { AccountLink } from "./account-link";
import { CartButton } from "./cart-button";
import { SearchIcon } from "./icons";
import { loadNavCategories } from "./load-categories";
import { MobileMenu } from "./mobile-menu";
import { buildNavLinks } from "./nav-links";
import { SiteLogo } from "./site-logo";

export async function Header() {
  const links = buildNavLinks(await loadNavCategories());

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100">
      <div className="mx-auto grid h-16 w-full max-w-page grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 sm:px-4 lg:flex lg:justify-between lg:px-8">
        <MobileMenu links={links} />

        <SiteLogo className="justify-self-center lg:flex-1" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-navy-800 underline-offset-8 hover:underline hover:decoration-gold-500 hover:decoration-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end lg:flex-1 lg:justify-end">
          {/* Search is UI only for now. */}
          <button
            type="button"
            aria-label="Search"
            className="inline-flex size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5"
          >
            <SearchIcon />
          </button>
          <AccountLink />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
