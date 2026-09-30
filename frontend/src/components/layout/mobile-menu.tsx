"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CloseIcon, MenuIcon } from "./icons";
import type { NavLink } from "./nav-links";

export function MobileMenu({ links, accountLinks }: { links: NavLink[]; accountLinks: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5"
      >
        <MenuIcon />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-navy-900/50 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-cream-100 shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-cream-300 px-4">
          <span className="text-sm font-extrabold uppercase tracking-[0.22em]">{siteConfig.name}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-md hover:bg-navy-800/5"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col">
            {[...links, ...accountLinks].map((link) => (
              <li key={link.href} className="border-b border-cream-300">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center text-lg font-medium text-navy-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="border-t border-cream-300 px-4 py-4 text-sm text-navy-500">
          Questions? Write to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-medium text-navy-800 underline">
            {siteConfig.supportEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
