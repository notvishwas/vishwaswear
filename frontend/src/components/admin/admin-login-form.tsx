"use client";

import { useActionState } from "react";
import { adminSignIn, type AdminLoginState } from "@/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminLoginState = { status: "idle" };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminSignIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={state.status === "error" ? state.email : undefined}
      />
      <Input id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
