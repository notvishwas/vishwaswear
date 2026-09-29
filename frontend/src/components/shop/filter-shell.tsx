"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/layout/icons";
import { cn } from "@/lib/utils";

type FilterShellProps = {
  /** The server-rendered filter panel. Sidebar on desktop, bottom sheet on mobile. */
  panel: ReactNode;
  /** Sort control shown beside the mobile Filter button. */
  sort: ReactNode;
  activeCount: number;
  children: ReactNode;
};

export function FilterShell({ panel, sort, activeCount, children }: FilterShellProps) {
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
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div
        className={cn(
          "fixed inset-0 z-50 bg-navy-900/50 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="filters"
        aria-label="Filters"
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-xl bg-cream-100 shadow-2xl",
          "transition-[transform,visibility] duration-300 ease-out",
          "lg:visible lg:sticky lg:inset-auto lg:top-24 lg:max-h-none lg:translate-y-0 lg:rounded-none lg:bg-transparent lg:shadow-none",
          open ? "visible translate-y-0" : "invisible translate-y-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-4 py-2 lg:hidden">
          <h2 className="text-base font-semibold text-navy-800">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-md hover:bg-navy-800/5"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 lg:overflow-visible lg:p-0">{panel}</div>

        <div className="border-t border-cream-300 p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 w-full rounded-md bg-navy-800 text-base font-semibold text-white hover:bg-navy-700"
          >
            View results
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-cream-300 pb-4 lg:justify-end">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="filters"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-navy-800 px-4 text-sm font-semibold text-navy-800 lg:hidden"
          >
            Filter
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-900">
                {activeCount}
              </span>
            )}
          </button>
          {sort}
        </div>
        {children}
      </div>
    </div>
  );
}
