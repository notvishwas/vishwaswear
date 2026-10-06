import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
import { FormSection } from "@/components/admin/form-field";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderItemsList } from "@/components/orders/order-items-list";
import { formatDateTime } from "@/lib/admin/format";
import { getOrderDetail } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/auth/admin";
import { parseShippingAddress } from "@/lib/orders/queries";
import { STATUS_LABELS } from "@/lib/orders/status";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order" };

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="shrink-0 text-navy-400">{label}</dt>
      <dd className="min-w-0 break-words text-right text-navy-800">{children}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const order = await getOrderDetail(id);
  if (!order) notFound();

  const address = parseShippingAddress(order.shipping_address);

  const timeline = [
    { key: "placed", label: "Order placed", note: null as string | null, at: order.created_at },
    ...(order.paid_at ? [{ key: "paid", label: "Payment received", note: null, at: order.paid_at }] : []),
    ...order.events.map((event) => ({
      key: event.id,
      label: STATUS_LABELS[event.status],
      note: event.note,
      at: event.created_at,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <PageHeader
        title={`Order ${order.order_number}`}
        description={`Placed ${formatDateTime(order.created_at)}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <Link href="/admin/orders" className="text-sm font-medium text-navy-800 underline underline-offset-4">
              All orders
            </Link>
          </>
        }
      />

      {order.payment_issue && (
        <div role="alert" className="mb-6 rounded-md border border-gold-500 bg-gold-50 p-4 text-sm text-navy-800">
          <p className="font-semibold">This payment needs attention</p>
          <p className="mt-1">
            {order.payment_issue === "insufficient_stock"
              ? "The customer paid, but an item sold out at the same moment. Refund the payment in Razorpay and let them know."
              : order.payment_issue}
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <FormSection title="Items">
            <div className="-mx-1">
              <OrderItemsList items={order.items} />
            </div>
            <dl className="flex flex-col gap-2 border-t border-cream-300 pt-4 text-sm">
              <Detail label="Subtotal">{formatPrice(order.subtotal_paise)}</Detail>
              <Detail label="Shipping">{order.shipping_paise === 0 ? "Free" : formatPrice(order.shipping_paise)}</Detail>
              <Detail label="Total">
                <span className="text-base font-semibold">{formatPrice(order.total_paise)}</span>
              </Detail>
            </dl>
          </FormSection>

          <FormSection title="Timeline">
            <ol className="flex flex-col">
              {timeline.map((entry, index) => (
                <li key={entry.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span aria-hidden="true" className="mt-1.5 size-3 rounded-full border-2 border-gold-500 bg-white" />
                    {index < timeline.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-gold-200" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-navy-800">{entry.label}</p>
                    <p className="text-xs text-navy-400">
                      {formatDateTime(entry.at)}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </FormSection>
        </div>

        <div className="flex flex-col gap-6">
          <FormSection title="Update status">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </FormSection>

          <FormSection title="Customer">
            <dl className="flex flex-col gap-2">
              <Detail label="Name">{address.fullName}</Detail>
              <Detail label="Email">
                <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                  {order.email}
                </a>
              </Detail>
              <Detail label="Mobile">{order.phone}</Detail>
              <Detail label="Account">{order.user_id ? "Signed-in customer" : "Guest checkout"}</Detail>
            </dl>
          </FormSection>

          <FormSection title="Shipping address">
            <address className="text-sm not-italic leading-relaxed text-navy-800">
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
            </address>
            {order.courier_name && (
              <dl className="mt-2 flex flex-col gap-2 border-t border-cream-300 pt-4">
                <Detail label="Courier">{order.courier_name}</Detail>
                {order.tracking_number && <Detail label="Tracking number">{order.tracking_number}</Detail>}
                {order.tracking_url && (
                  <Detail label="Tracking link">
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      Open
                    </a>
                  </Detail>
                )}
              </dl>
            )}
          </FormSection>

          <FormSection title="Payment">
            <dl className="flex flex-col gap-2">
              <Detail label="Amount">{formatPrice(order.total_paise)}</Detail>
              <Detail label="Paid at">{order.paid_at ? formatDateTime(order.paid_at) : "Not paid"}</Detail>
              <Detail label="Razorpay order">{order.razorpay_order_id ?? "None"}</Detail>
              <Detail label="Razorpay payment">{order.razorpay_payment_id ?? "None"}</Detail>
            </dl>
          </FormSection>
        </div>
      </div>
    </>
  );
}
