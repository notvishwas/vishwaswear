import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading as="h1" title="Your cart" className="mb-8 sm:mb-10" />
      <CartPageContent />
    </Container>
  );
}
