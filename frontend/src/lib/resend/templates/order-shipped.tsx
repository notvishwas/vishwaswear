import { Button, Heading, Text } from "@react-email/components";
import { siteConfig } from "@/config/site";
import { EmailLayout, emailButton, emailColors, emailHeading, emailText } from "./email-layout";
import type { ShippedEmailData } from "./types";

export function OrderShippedEmail({ order }: { order: ShippedEmailData }) {
  const firstName = order.customerName.split(" ")[0] || "there";
  const { address } = order;

  return (
    <EmailLayout preview={`Your ${siteConfig.name} order ${order.orderNumber} is on its way`}>
      <Heading as="h1" style={emailHeading}>
        Your order is on its way
      </Heading>
      <Text style={emailText}>
        Hi {firstName}, order <strong>{order.orderNumber}</strong> has shipped with{" "}
        <strong>{order.courierName}</strong>.
      </Text>

      {order.trackingNumber && (
        <Text style={{ ...emailText, color: emailColors.navyMuted }}>
          Tracking number: <strong style={{ color: emailColors.navy }}>{order.trackingNumber}</strong>
        </Text>
      )}

      {order.trackingUrl && (
        <Button href={order.trackingUrl} style={{ ...emailButton, margin: "8px 0 20px" }}>
          Track your package
        </Button>
      )}

      <Text style={{ ...emailText, margin: "16px 0 4px", fontWeight: 600 }}>Delivering to</Text>
      <Text style={{ ...emailText, margin: 0 }}>
        {address.fullName}, {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pincode}
      </Text>

      <Text style={{ ...emailText, fontSize: "13px", color: emailColors.navyMuted, margin: "20px 0 0" }}>
        You can also check the status at{" "}
        <a href={order.trackOrderUrl} style={{ color: emailColors.navy }}>
          Track your order
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
