"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container size="narrow" className="flex flex-col items-center py-24 text-center sm:py-32">
      <h1 className="text-3xl font-semibold tracking-tight text-navy-800 sm:text-4xl">
        Something went wrong
      </h1>
      <span aria-hidden="true" className="mt-6 block h-px w-12 bg-gold-500" />
      <p role="alert" className="mt-6 max-w-md text-navy-500">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </Container>
  );
}
