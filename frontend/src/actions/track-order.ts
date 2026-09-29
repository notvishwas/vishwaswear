"use server";

import { z } from "zod";
import { getOrderByNumber, normalizeOrderNumber } from "@/lib/orders/queries";
import type { OrderStatus } from "@/types";

const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(3, { error: "Enter your order number" }).max(30),
  email: z.email({ error: "Enter the email you used at checkout" }).trim().toLowerCase(),
});

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  totalPaise: number;
  items: { id: string; name: string; size: string; color: string; quantity: number; imageUrl: string | null }[];
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

export type TrackOrderState =
  | { status: "idle" }
  | { status: "error"; message: string; values: { orderNumber: string; email: string } }
  | { status: "found"; order: TrackedOrder };

const NOT_FOUND_MESSAGE =
  "We couldn't find an order with those details. Check the order number and the email you used at checkout.";

/** Looks up an order by number plus the email on it. Mismatches all give the same message. */
export async function trackOrder(_previous: TrackOrderState, formData: FormData): Promise<TrackOrderState> {
  const values = {
    orderNumber: String(formData.get("orderNumber") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = trackOrderSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? NOT_FOUND_MESSAGE, values };
  }

  try {
    const order = await getOrderByNumber(normalizeOrderNumber(parsed.data.orderNumber));
    if (!order || order.email.toLowerCase() !== parsed.data.email) {
      return { status: "error", message: NOT_FOUND_MESSAGE, values };
    }

    return {
      status: "found",
      order: {
        orderNumber: order.order_number,
        status: order.status,
        placedAt: order.created_at,
        totalPaise: order.total_paise,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.product_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          imageUrl: item.image_url,
        })),
        courierName: order.courier_name,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
      },
    };
  } catch (error) {
    console.error("[track-order] lookup failed", error);
    return { status: "error", message: "Something went wrong on our side. Please try again.", values };
  }
}
