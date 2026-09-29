import type { ShippingAddress } from "@/lib/orders/queries";

export type OrderEmailItem = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPricePaise: number;
  /** Absolute URL, or null when there is no email-safe image. */
  imageUrl: string | null;
};

export type OrderEmailData = {
  orderNumber: string;
  placedAt: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderEmailItem[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  address: ShippingAddress;
  deliveryWindow: string;
  confirmationUrl: string;
  trackOrderUrl: string;
};

export type ShippedEmailData = {
  orderNumber: string;
  customerName: string;
  courierName: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  address: ShippingAddress;
  trackOrderUrl: string;
};
