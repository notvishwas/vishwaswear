import "server-only";
import { formatDeliveryWindow } from "@/config/shipping";
import { siteConfig } from "@/config/site";
import { getEmailEnv } from "@/lib/resend/env";
import { sendEmail } from "@/lib/resend/send";
import { AdminNewOrderEmail } from "@/lib/resend/templates/admin-new-order";
import { OrderConfirmationEmail } from "@/lib/resend/templates/order-confirmation";
import { OrderShippedEmail } from "@/lib/resend/templates/order-shipped";
import type { OrderEmailData, ShippedEmailData } from "@/lib/resend/templates/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Order } from "@/types";
import { parseShippingAddress, type OrderWithItems } from "./queries";
import { getConfirmationPath } from "./token";

type EmailFlag = "customer_email_sent_at" | "admin_email_sent_at" | "shipped_email_sent_at";

const PAID_STATUSES: Order["status"][] = ["paid", "processing", "shipped", "delivered"];

function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/** Most email clients cannot render SVG, so only raster images are included. */
function emailImageUrl(url: string | null): string | null {
  if (!url || url.toLowerCase().split("?")[0].endsWith(".svg")) return null;
  return absoluteUrl(url);
}

export function buildOrderEmailData(order: OrderWithItems): OrderEmailData {
  const address = parseShippingAddress(order.shipping_address);
  return {
    orderNumber: order.order_number,
    placedAt: order.created_at,
    customerName: address.fullName,
    email: order.email,
    phone: order.phone,
    items: order.items.map((item) => ({
      name: item.product_name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPricePaise: item.unit_price_paise,
      imageUrl: emailImageUrl(item.image_url),
    })),
    subtotalPaise: order.subtotal_paise,
    shippingPaise: order.shipping_paise,
    totalPaise: order.total_paise,
    address,
    deliveryWindow: formatDeliveryWindow(new Date(order.paid_at ?? order.created_at)),
    confirmationUrl: absoluteUrl(getConfirmationPath(order.order_number)),
    trackOrderUrl: absoluteUrl("/track-order"),
  };
}

/**
 * Claims an email with one atomic UPDATE ... WHERE flag IS NULL. Only the caller whose UPDATE matched
 * a row gets to send, so concurrent webhook and browser paths cannot both send the same email.
 */
async function claim(orderId: string, flag: EmailFlag): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const patch = { [flag]: new Date().toISOString() } as Partial<Record<EmailFlag, string>>;
  const { data, error } = await admin.from("orders").update(patch).eq("id", orderId).is(flag, null).select("id");
  if (error) {
    console.error("[email] Failed to claim email", { orderId, flag, error: error.message });
    return false;
  }
  return data.length > 0;
}

/** Gives the claim back after a failed send so a later retry (a webhook redelivery) can try again. */
async function release(orderId: string, flag: EmailFlag): Promise<void> {
  const admin = createAdminSupabaseClient();
  const patch = { [flag]: null } as Partial<Record<EmailFlag, null>>;
  const { error } = await admin.from("orders").update(patch).eq("id", orderId);
  if (error) console.error("[email] Failed to release email claim", { orderId, flag, error: error.message });
}

async function loadByRazorpayOrderId(razorpayOrderId: string): Promise<OrderWithItems | null> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return data;
}

/**
 * Sends the customer confirmation and the admin notification for a paid order, each at most once.
 * Safe to call from every payment path: already-sent emails are skipped, and failures are logged.
 */
export async function sendOrderPaidEmails(razorpayOrderId: string): Promise<void> {
  try {
    const order = await loadByRazorpayOrderId(razorpayOrderId);
    if (!order || !PAID_STATUSES.includes(order.status)) return;

    const data = buildOrderEmailData(order);

    if (!order.customer_email_sent_at && (await claim(order.id, "customer_email_sent_at"))) {
      const result = await sendEmail({
        to: order.email,
        subject: `Your ${siteConfig.name} order ${order.order_number} is confirmed`,
        react: OrderConfirmationEmail({ order: data }),
        replyTo: siteConfig.supportEmail,
      });
      if (!result.ok) await release(order.id, "customer_email_sent_at");
    }

    const { adminEmail } = getEmailEnv();
    if (adminEmail && !order.admin_email_sent_at && (await claim(order.id, "admin_email_sent_at"))) {
      const result = await sendEmail({
        to: adminEmail,
        subject: `New order ${order.order_number}: ${data.customerName}`,
        react: AdminNewOrderEmail({ order: data }),
        replyTo: order.email,
      });
      if (!result.ok) await release(order.id, "admin_email_sent_at");
    }
  } catch (error) {
    console.error("[email] sendOrderPaidEmails failed", { razorpayOrderId, error });
  }
}

/** Sends the shipped email once, using the courier details already stored on the order. */
export async function sendOrderShippedEmail(order: OrderWithItems): Promise<void> {
  try {
    if (order.shipped_email_sent_at || !order.courier_name) return;
    if (!(await claim(order.id, "shipped_email_sent_at"))) return;

    const address = parseShippingAddress(order.shipping_address);
    const data: ShippedEmailData = {
      orderNumber: order.order_number,
      customerName: address.fullName,
      courierName: order.courier_name,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      address,
      trackOrderUrl: absoluteUrl("/track-order"),
    };

    const result = await sendEmail({
      to: order.email,
      subject: `Your ${siteConfig.name} order ${order.order_number} has shipped`,
      react: OrderShippedEmail({ order: data }),
      replyTo: siteConfig.supportEmail,
    });
    if (!result.ok) await release(order.id, "shipped_email_sent_at");
  } catch (error) {
    console.error("[email] sendOrderShippedEmail failed", { orderNumber: order.order_number, error });
  }
}
