import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Container } from "@/components/ui/container";
import { getCurrentUser, getUserDisplayName } from "@/lib/auth/user";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading as="h1" title="Checkout" className="mb-8 sm:mb-10" />
      <CheckoutForm
        defaultEmail={user?.email ?? ""}
        defaultName={user ? getUserDisplayName(user) : ""}
        signedIn={Boolean(user)}
      />
    </Container>
  );
}
