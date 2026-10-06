import type { ReactNode } from "react";
import { adminSignOut } from "@/actions/admin-auth";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminNavLinks } from "./admin-nav-links";
import { ToastProvider } from "./toast";

/** Admin chrome: navy sidebar (a drawer on mobile), top bar with the site name and signed-in admin. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const { displayName } = await requireAdmin();

  return (
    <div className="min-h-dvh bg-cream-100 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <aside className="hidden bg-navy-800 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex h-14 items-center border-b border-white/10 px-6">
          <span className="text-sm font-extrabold uppercase tracking-[0.18em]">{siteConfig.name}</span>
        </div>
        <div className="py-4">
          <AdminNavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-cream-300 bg-white px-4 sm:px-6">
          <AdminMobileNav siteName={siteConfig.name} />
          <p className="text-sm font-semibold text-navy-800">
            {siteConfig.name} <span className="font-normal text-navy-400">Admin</span>
          </p>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden max-w-48 truncate text-sm text-navy-600 sm:block">{displayName}</span>
            <form action={adminSignOut}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md border border-navy-800 px-3 text-sm font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main id="admin-main" className="flex-1 p-4 sm:p-6 lg:p-8">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
