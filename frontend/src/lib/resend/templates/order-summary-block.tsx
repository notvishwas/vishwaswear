import { Column, Hr, Img, Row, Section, Text } from "@react-email/components";
import { formatPrice } from "@/lib/utils";
import { emailColors, emailFont, emailText } from "./email-layout";
import type { OrderEmailData } from "./types";

const small = { ...emailText, fontSize: "13px", lineHeight: "20px", margin: 0 } as const;

/** Item rows and totals, shared by the customer and admin order emails. */
export function OrderSummaryBlock({ order }: { order: OrderEmailData }) {
  return (
    <Section>
      {order.items.map((item, index) => (
        <Row key={`${item.name}-${item.size}-${item.color}-${index}`} style={{ marginBottom: "14px" }}>
          {item.imageUrl && (
            <Column style={{ width: "64px", verticalAlign: "top" }}>
              <Img src={item.imageUrl} alt="" width="52" height="65" style={{ borderRadius: "2px", objectFit: "cover" }} />
            </Column>
          )}
          <Column style={{ verticalAlign: "top" }}>
            <Text style={{ ...emailText, margin: 0, fontWeight: 600 }}>{item.name}</Text>
            <Text style={{ ...small, color: emailColors.navyMuted }}>
              Size {item.size} · {item.color} · Qty {item.quantity}
            </Text>
          </Column>
          <Column style={{ width: "96px", verticalAlign: "top", textAlign: "right" }}>
            <Text style={{ ...emailText, margin: 0, fontWeight: 600 }}>
              {formatPrice(item.unitPricePaise * item.quantity)}
            </Text>
          </Column>
        </Row>
      ))}

      <Hr style={{ borderColor: emailColors.border, margin: "8px 0 12px" }} />

      <TotalRow label="Subtotal" value={formatPrice(order.subtotalPaise)} />
      <TotalRow label="Shipping" value={order.shippingPaise === 0 ? "Free" : formatPrice(order.shippingPaise)} />
      <TotalRow label="Total paid" value={formatPrice(order.totalPaise)} strong />
    </Section>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  const style = { ...emailText, margin: "0 0 4px", fontFamily: emailFont, fontWeight: strong ? 700 : 400 } as const;
  return (
    <Row>
      <Column>
        <Text style={style}>{label}</Text>
      </Column>
      <Column style={{ textAlign: "right" }}>
        <Text style={style}>{value}</Text>
      </Column>
    </Row>
  );
}

export function AddressBlock({ order }: { order: OrderEmailData }) {
  const { address } = order;
  return (
    <Text style={{ ...emailText, margin: 0 }}>
      {address.fullName}
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.city}, {address.state} {address.pincode}
      {address.landmark && (
        <>
          <br />
          Landmark: {address.landmark}
        </>
      )}
      <br />
      Mobile: {order.phone}
    </Text>
  );
}
