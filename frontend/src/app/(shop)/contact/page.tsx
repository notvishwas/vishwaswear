import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/layout/contact-form";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { deliveryWindow } from "@/config/shipping";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Get in touch with ${siteConfig.name} about an order, sizing or anything else.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container size="narrow" className="py-8 sm:py-14">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact us", href: "/contact" },
        ]}
      />
      <SectionHeading
        as="h1"
        title="Contact us"
        description="Questions about an order, sizing or a piece you are considering? Send us a message and we will get back to you."
        className="my-8 sm:mb-10"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <ContactForm />

        <aside aria-label="Other ways to reach us" className="text-sm leading-relaxed text-navy-600">
          <h2 className="text-base font-semibold text-navy-800">Prefer email?</h2>
          <p className="mt-2">
            <a href={`mailto:${siteConfig.supportEmail}`} className="font-medium text-navy-800 underline underline-offset-4">
              {siteConfig.supportEmail}
            </a>
          </p>
          <h2 className="mt-6 text-base font-semibold text-navy-800">Response time</h2>
          <p className="mt-2">We reply within one working day, Monday to Friday.</p>
          <h2 className="mt-6 text-base font-semibold text-navy-800">Order status</h2>
          <p className="mt-2">
            Orders arrive in {deliveryWindow.minBusinessDays} to {deliveryWindow.maxBusinessDays} business days. Check yours any time on the{" "}
            <Link href="/track-order" className="font-medium text-navy-800 underline underline-offset-4">
              Track your order
            </Link>{" "}
            page.
          </p>
        </aside>
      </div>
    </Container>
  );
}
