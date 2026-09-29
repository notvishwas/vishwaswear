import { Button, Heading, Text } from "@react-email/components";
import { siteConfig } from "@/config/site";
import { EmailLayout, emailButton, emailColors, emailHeading, emailText } from "./email-layout";
import { AddressBlock, OrderSummaryBlock } from "./order-summary-block";
import type { OrderEmailData } from "./types";

export function OrderConfirmationEmail({ order }: { order: OrderEmailData }) {
  const firstName = order.customerName.split(" ")[0] || "there";

  return (
    <EmailLayout preview={`Your ${siteConfig.name} order ${order.orderNumber} is confirmed`}>
      <Heading as="h1" style={emailHeading}>
        Thank you, {firstName}
      </Heading>
      <Text style={emailText}>
        Your payment was received and order <strong>{order.orderNumber}</strong> is confirmed. We&apos;ll email
        you again as soon as it ships.
      </Text>
      <Text style={{ ...emailText, color: emailColors.navyMuted }}>
        Expected delivery: <strong style={{ color: emailColors.navy }}>{order.deliveryWindow}</strong>
      </Text>

      <OrderSummaryBlock order={order} />

      <Heading as="h2" style={{ ...emailHeading, fontSize: "16px", margin: "24px 0 8px" }}>
        Shipping to
      </Heading>
      <AddressBlock order={order} />

      <Button href={order.confirmationUrl} style={{ ...emailButton, marginTop: "28px" }}>
        View your order
      </Button>
      <Text style={{ ...emailText, fontSize: "13px", color: emailColors.navyMuted, margin: "20px 0 0" }}>
        You can check the status any time at{" "}
        <a href={order.trackOrderUrl} style={{ color: emailColors.navy }}>
          Track your order
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
