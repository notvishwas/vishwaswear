import type { OrderStatus } from "@/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Payment received",
  processing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** The happy path an order moves through, in order. */
export const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Order confirmed" },
  { status: "processing", label: "Being prepared" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

/** Index of the current step in the timeline, or -1 for statuses outside it. */
export function timelineIndex(status: OrderStatus): number {
  return TIMELINE_STEPS.findIndex((step) => step.status === status);
}

export function isPaidStatus(status: OrderStatus): boolean {
  return timelineIndex(status) !== -1;
}
