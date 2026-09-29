"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type SubscribeState } from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";

const initialState: SubscribeState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section aria-labelledby="newsletter-heading" className="bg-navy-800 py-14 text-white sm:py-20">
      <Container size="narrow" className="text-center">
        <h2 id="newsletter-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Join the list
        </h2>
        <span aria-hidden="true" className="mx-auto mt-4 block h-px w-12 bg-gold-500" />
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-navy-200 sm:text-base">
          New arrivals, styling notes and early access to seasonal offers. One email a fortnight, and
          you can unsubscribe at any time.
        </p>

        {state.status === "success" ? (
          <p role="status" className="mx-auto mt-8 max-w-md rounded-md border border-gold-500 px-4 py-3 text-sm text-gold-100">
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left sm:flex-row sm:items-end">
            <Input
              id="newsletter-email"
              type="email"
              name="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              required
              error={state.status === "error" ? state.message : undefined}
              className="flex-1 [&_label]:text-navy-100"
            />
            {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <Button type="submit" loading={pending} className="border-gold-500 bg-gold-500 text-navy-900 hover:bg-gold-400">
              Subscribe
            </Button>
          </form>
        )}
      </Container>
    </section>
  );
}
