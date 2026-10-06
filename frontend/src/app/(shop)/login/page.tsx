import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/user";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Google sign-in was cancelled. You can try again whenever you're ready.",
  oauth: "We couldn't sign you in with Google. Please try again.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  const errorKey = typeof params.error === "string" ? params.error : undefined;

  if (await getCurrentUser()) redirect(next);

  return (
    <Container size="prose" className="py-12 sm:py-20">
      <SectionHeading
        as="h1"
        title="Sign in"
        description="Sign in to see your orders in one place and check out faster. You can also check out as a guest."
        align="center"
      />

      <div className="mx-auto mt-10 max-w-sm">
        {errorKey && (
          <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.oauth}
          </p>
        )}
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <GoogleSignInButton />
        </form>
        <p className="mt-6 text-center text-xs leading-relaxed text-navy-400">
          We only use your name and email from Google. Your Google password is never shared with us.
        </p>
      </div>
    </Container>
  );
}
