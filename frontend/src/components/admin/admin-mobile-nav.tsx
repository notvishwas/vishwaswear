"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/layout/icons";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import { AdminNavLinks } from "./admin-nav-links";

/** Hamburger plus slide-in drawer holding the same links as the desktop sidebar. */
export function AdminMobileNav({ siteName }: { siteName: string }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, drawerRef);

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
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls="admin-drawer"
        onClick={() => setOpen(true)}
        className="-ml-2 inline-flex size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5"
      >
        <MenuIcon />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-navy-900/60 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        id="admin-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        inert={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col bg-navy-800 text-white shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <span className="text-sm font-extrabold uppercase tracking-[0.18em]">{siteName}</span>
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-md hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="py-4">
          <AdminNavLinks onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
