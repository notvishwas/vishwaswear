import { Heading, Text } from "@react-email/components";
import { EmailLayout, emailColors, emailHeading, emailText } from "./email-layout";
import { AddressBlock, OrderSummaryBlock } from "./order-summary-block";
import type { OrderEmailData } from "./types";

export function AdminNewOrderEmail({ order }: { order: OrderEmailData }) {
  return (
    <EmailLayout preview={`New paid order ${order.orderNumber}`}>
      <Heading as="h1" style={emailHeading}>
        New order {order.orderNumber}
      </Heading>
      <Text style={{ ...emailText, color: emailColors.navyMuted }}>
        Paid and ready to process. Customer: {order.customerName} ({order.email}, {order.phone}). Promised
        delivery: {order.deliveryWindow}.
      </Text>

      <OrderSummaryBlock order={order} />

      <Heading as="h2" style={{ ...emailHeading, fontSize: "16px", margin: "24px 0 8px" }}>
        Ship to
      </Heading>
      <AddressBlock order={order} />
    </EmailLayout>
  );
}
