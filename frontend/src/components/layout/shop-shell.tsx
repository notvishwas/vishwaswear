import type { ReactNode } from "react";
import { OrganizationJsonLd } from "@/components/shop/organization-json-ld";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "./footer";
import { Header } from "./header";

/** Storefront chrome: skip link, header, main landmark, footer and the cart drawer. */
export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <OrganizationJsonLd />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
