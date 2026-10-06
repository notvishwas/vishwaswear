"use client";

import Link from "next/link";
import { useHasSession } from "@/hooks/use-auth-user";
import { UserIcon } from "./icons";

/** Desktop header entry: filled avatar when a session exists, outline icon to sign in otherwise. */
export function AccountLink() {
  const hasSession = useHasSession();
  const signedIn = hasSession === true;

  return (
    <Link
      href={signedIn ? "/account" : "/login"}
      aria-label={signedIn ? "Your account" : "Sign in"}
      className="hidden size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-800/5 lg:inline-flex"
    >
      {signedIn ? (
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-navy-800 text-white">
          <UserIcon className="size-5" />
        </span>
      ) : (
        <UserIcon />
      )}
    </Link>
  );
}
