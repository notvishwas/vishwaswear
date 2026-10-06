import type { OrderStatus } from "@/types";

/**
 * Status changes an admin may make. Mirrors `admin_update_order_status` in the database, which is
 * the one that actually enforces it. A cancelled or refunded order is final.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "shipped", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[status];
}

/** Statuses that put the order's stock back on the shelves. */
export function restoresStock(status: OrderStatus): boolean {
  return status === "cancelled" || status === "refunded";
}
