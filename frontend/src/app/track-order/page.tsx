import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/orders/track-order-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Enter your order number and email to see where your order is.",
};

export default function TrackOrderPage() {
  return (
    <Container size="prose" className="py-8 sm:py-14">
      <SectionHeading
        as="h1"
        title="Track your order"
        description="Enter the order number from your confirmation email and the email you used at checkout."
        className="mb-8"
      />
      <TrackOrderForm />
    </Container>
  );
}
