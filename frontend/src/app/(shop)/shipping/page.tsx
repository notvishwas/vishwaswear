import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { deliveryWindow, shippingConfig } from "@/config/shipping";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping and delivery",
  description: `Delivery times, shipping charges and tracking for ${siteConfig.name} orders across India.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping and delivery"
      path="/shipping"
      intro="What it costs, how long it takes and how to follow your order."
    >
      <h2>Where we deliver</h2>
      <p>We deliver to addresses across India. We do not ship internationally at the moment.</p>

      <h2>Shipping charges</h2>
      <ul>
        <li>
          <strong>Free shipping</strong> on orders above {formatPrice(shippingConfig.freeShippingThresholdPaise)}.
        </li>
        <li>
          <strong>{formatPrice(shippingConfig.flatFeePaise)}</strong> flat shipping on orders of {formatPrice(shippingConfig.freeShippingThresholdPaise)} or less.
        </li>
      </ul>
      <p>The shipping charge is calculated from your cart total and shown before you pay. There are no hidden fees at the door.</p>

      <h2>Delivery times</h2>
      <p>
        Orders usually arrive within <strong>{deliveryWindow.minBusinessDays} to {deliveryWindow.maxBusinessDays} business days</strong> of
        your payment being confirmed. Business days are Monday to Friday, excluding public holidays. Remote locations, festivals and
        severe weather can add a day or two. Your confirmation page and email show the expected delivery window for your order.
      </p>

      <h2>Order processing</h2>
      <p>
        Once your payment is confirmed we prepare your order and hand it to the courier. If your order includes a piece that needs
        alteration, it may take slightly longer to leave us, and we will tell you if that is the case.
      </p>

      <h2>Tracking your order</h2>
      <p>
        We email you when your order ships, with the courier name and a tracking number or link. You can also check the status at any
        time on the <Link href="/track-order">Track your order</Link> page using your order number and email address.
      </p>

      <h2>If something goes wrong</h2>
      <p>
        If your parcel arrives damaged, looks opened, or has not arrived by the end of the delivery window, write to{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> with your order number. Please keep the packaging and
        take a photo if anything is damaged. We will sort it out quickly.
      </p>
    </ContentPage>
  );
}
