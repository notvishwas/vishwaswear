"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_TOPICS } from "@/lib/contact/topics";

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-gold-500 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-800">Message sent</h2>
        <p className="mt-2 text-sm text-navy-600">Thank you. We have your message and will reply by email, usually within one working day.</p>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : undefined;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.status === "error" && !fieldErrors && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="name" name="name" label="Your name" autoComplete="name" defaultValue={values?.name} error={fieldErrors?.name} required />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          defaultValue={values?.email}
          error={fieldErrors?.email}
          required
        />
      </div>
      <Select id="topic" name="topic" label="Topic" defaultValue={values?.topic || ""} error={fieldErrors?.topic} required>
        <option value="" disabled>
          Choose a topic
        </option>
        {CONTACT_TOPICS.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </Select>
      <Textarea
        id="message"
        name="message"
        label="Message"
        rows={6}
        defaultValue={values?.message}
        error={fieldErrors?.message}
        hint="If it's about an order, include your order number."
        required
      />
      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <Button type="submit" size="lg" loading={pending}>
        Send message
      </Button>
    </form>
  );
}
