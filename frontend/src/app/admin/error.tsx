"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-100 px-4 text-center">
      <h1 className="text-2xl font-semibold text-navy-800">Something went wrong</h1>
      <p role="alert" className="mt-2 max-w-sm text-sm text-navy-500">
        The admin page couldn&apos;t load. If you just ran a database migration, check that all migrations are applied.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
