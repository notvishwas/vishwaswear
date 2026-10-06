import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItemsList } from "@/components/orders/order-items-list";
import { PendingRefresh } from "@/components/orders/pending-refresh";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { formatDeliveryWindow } from "@/config/shipping";
import { getOrderByNumber, parseShippingAddress } from "@/lib/orders/queries";
import { isPaidStatus, STATUS_LABELS } from "@/lib/orders/status";
import { verifyOrderToken } from "@/lib/orders/token";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps<"/order/[orderNumber]/confirmation">) {
  const { orderNumber: rawOrderNumber } = await params;
  const { token } = await searchParams;
  const orderNumber = decodeURIComponent(rawOrderNumber);

  // A wrong or missing token looks exactly like a missing order, so order numbers can't be probed.
  if (!verifyOrderToken(orderNumber, typeof token === "string" ? token : undefined)) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const address = parseShippingAddress(order.shipping_address);
  const paid = isPaidStatus(order.status);
  const pending = order.status === "pending_payment";
  const firstName = address.fullName.split(" ")[0] || "there";

  return (
    <Container size="narrow" className="py-8 sm:py-14">
      {pending && <PendingRefresh />}

      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold-500 text-2xl text-gold-700"
        >
          {paid ? "✓" : "…"}
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-navy-800 sm:text-4xl">
          {paid ? `Thank you, ${firstName}` : "Confirming your payment"}
        </h1>
        <span aria-hidden="true" className="mx-auto mt-5 block h-px w-12 bg-gold-500" />
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-navy-500 sm:text-base">
          {paid
            ? `Your order is confirmed. We've sent the details to ${order.email}.`
            : "We're waiting for the bank to confirm your payment. This page updates on its own; there's no need to pay again."}
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-md border border-cream-300 bg-white p-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-navy-400">Order number</dt>
          <dd className="mt-1 font-semibold text-navy-800">{order.order_number}</dd>
        </div>
        <div>
          <dt className="text-navy-400">Payment</dt>
          <dd className="mt-1">
            <Badge variant={paid ? "gold" : "outline"}>{paid ? "Paid" : STATUS_LABELS[order.status]}</Badge>
          </dd>
        </div>
        {paid && (
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-navy-400">Expected delivery</dt>
            <dd className="mt-1 font-semibold text-navy-800">
              {formatDeliveryWindow(new Date(order.paid_at ?? order.created_at))}
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="items-heading" className="mt-8">
        <h2 id="items-heading" className="text-lg font-semibold text-navy-800">
          Your items
        </h2>
        <div className="mt-2 rounded-md border border-cream-300 bg-white px-4">
          <OrderItemsList items={order.items} />
        </div>

        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-500">Subtotal</dt>
            <dd className="font-medium text-navy-800">{formatPrice(order.subtotal_paise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-500">Shipping</dt>
            <dd className="font-medium text-navy-800">
              {order.shipping_paise === 0 ? "Free" : formatPrice(order.shipping_paise)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-cream-300 pt-3 text-base">
            <dt className="font-semibold text-navy-800">Total</dt>
            <dd className="font-semibold text-navy-800">{formatPrice(order.total_paise)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="address-heading" className="mt-8">
        <h2 id="address-heading" className="text-lg font-semibold text-navy-800">
          Shipping address
        </h2>
        <address className="mt-2 rounded-md border border-cream-300 bg-white p-4 text-sm not-italic leading-relaxed text-navy-600">
          <span className="font-semibold text-navy-800">{address.fullName}</span>
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
        </address>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-md border border-navy-800 bg-navy-800 px-8 text-base font-semibold text-white hover:bg-navy-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/track-order"
          className="inline-flex h-12 items-center justify-center rounded-md border border-navy-800 px-8 text-base font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
        >
          Track your order
        </Link>
      </div>
    </Container>
  );
}
