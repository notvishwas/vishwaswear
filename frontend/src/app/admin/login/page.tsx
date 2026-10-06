import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminSignOut } from "@/actions/admin-auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { siteConfig } from "@/config/site";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;

  if (await isCurrentUserAdmin()) redirect("/admin");
  const signedInWithoutAccess = error === "forbidden" && (await getCurrentUser()) !== null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-extrabold uppercase tracking-[0.22em] text-navy-800">
          {siteConfig.name}
        </p>
        <div className="mt-6 rounded-md border border-cream-300 border-t-gold-500 bg-white p-6 shadow-sm [border-top-width:3px]">
          <h1 className="text-xl font-semibold text-navy-800">Admin sign in</h1>
          <p className="mt-1 text-sm text-navy-500">Use the email and password for your admin account.</p>

          {signedInWithoutAccess && (
            <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <p>The account you are signed in with doesn&apos;t have admin access.</p>
              <form action={adminSignOut} className="mt-2">
                <button type="submit" className="font-semibold underline underline-offset-4">
                  Sign out
                </button>
              </form>
            </div>
          )}

          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
