import Link from "next/link";
import { getCurrentUser, getUserDisplayName } from "@/lib/auth/user";
import { UserIcon } from "./icons";

/** Desktop header entry: initial avatar when signed in, sign-in icon otherwise. */
export async function AccountLink() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="hidden size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5 lg:inline-flex"
      >
        <UserIcon />
      </Link>
    );
  }

  const name = getUserDisplayName(user);
  return (
    <Link
      href="/account"
      aria-label={`Your account, ${name}`}
      className="hidden size-11 items-center justify-center rounded-md hover:bg-navy-800/5 lg:inline-flex"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </Link>
  );
}
