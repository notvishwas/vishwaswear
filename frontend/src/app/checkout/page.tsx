import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading as="h1" title="Checkout" className="mb-8 sm:mb-10" />
      <CheckoutForm />
    </Container>
  );
}
