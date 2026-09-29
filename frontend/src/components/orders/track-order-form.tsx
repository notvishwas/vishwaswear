"use client";

import Image from "next/image";
import { useActionState } from "react";
import { trackOrder, type TrackOrderState, type TrackedOrder } from "@/actions/track-order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, TIMELINE_STEPS, timelineIndex } from "@/lib/orders/status";
import { cn, formatPrice } from "@/lib/utils";

const initialState: TrackOrderState = { status: "idle" };

function OrderStatusView({ order }: { order: TrackedOrder }) {
  const current = timelineIndex(order.status);
  const closed = order.status === "cancelled" || order.status === "refunded";
  const placed = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(
    new Date(order.placedAt),
  );

  return (
    <section aria-labelledby="order-status-heading" className="mt-10 rounded-md border border-cream-300 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="order-status-heading" className="text-lg font-semibold text-navy-800">
            Order {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            Placed {placed} · {formatPrice(order.totalPaise)}
          </p>
        </div>
        <Badge variant={closed ? "outline" : "gold"}>{STATUS_LABELS[order.status]}</Badge>
      </div>

      {order.status === "pending_payment" && (
        <p className="mt-5 rounded-md bg-gold-50 p-3 text-sm text-navy-800">
          We haven&apos;t received the payment for this order yet. If you were charged, it will be confirmed
          automatically within a few minutes.
        </p>
      )}

      {closed ? (
        <p className="mt-5 text-sm text-navy-600">
          This order was {order.status === "refunded" ? "refunded" : "cancelled"}. If you have questions, please
          contact us.
        </p>
      ) : (
        current !== -1 && (
          <ol className="mt-6 flex flex-col gap-0" aria-label="Order progress">
            {TIMELINE_STEPS.map((step, index) => {
              const done = index <= current;
              return (
                <li key={step.status} className="flex gap-3" aria-current={index === current ? "step" : undefined}>
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border text-xs",
                        done ? "border-gold-500 bg-gold-500 text-navy-900" : "border-navy-200 text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    {index < TIMELINE_STEPS.length - 1 && (
                      <span aria-hidden="true" className={cn("h-6 w-px", index < current ? "bg-gold-500" : "bg-navy-100")} />
                    )}
                  </div>
                  <p className={cn("pb-6 text-sm", done ? "font-medium text-navy-800" : "text-navy-400")}>{step.label}</p>
                </li>
              );
            })}
          </ol>
        )
      )}

      {order.courierName && (order.status === "shipped" || order.status === "delivered") && (
        <div className="mt-2 rounded-md bg-cream-100 p-4 text-sm text-navy-600">
          <p>
            Courier: <span className="font-semibold text-navy-800">{order.courierName}</span>
          </p>
          {order.trackingNumber && (
            <p className="mt-1">
              Tracking number: <span className="font-semibold text-navy-800">{order.trackingNumber}</span>
            </p>
          )}
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-navy-800 underline underline-offset-4"
            >
              Track your package
            </a>
          )}
        </div>
      )}

      <ul className="mt-6 divide-y divide-cream-300 border-t border-cream-300">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-sm bg-cream-200">
              {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-medium text-navy-800">{item.name}</p>
              <p className="text-xs text-navy-500">
                Size {item.size} · {item.color} · Qty {item.quantity}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TrackOrderForm() {
  const [state, formAction, pending] = useActionState(trackOrder, initialState);
  const values = state.status === "error" ? state.values : undefined;

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          id="orderNumber"
          name="orderNumber"
          label="Order number"
          placeholder="ORD-100001"
          autoComplete="off"
          required
          defaultValue={values?.orderNumber}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          defaultValue={values?.email}
        />
        {state.status === "error" && (
          <p role="alert" className="text-sm text-red-700">
            {state.message}
          </p>
        )}
        <Button type="submit" size="lg" loading={pending}>
          Track order
        </Button>
      </form>

      {state.status === "found" && <OrderStatusView order={state.order} />}
    </div>
  );
}
