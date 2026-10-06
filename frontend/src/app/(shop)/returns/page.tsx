import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns and exchanges",
  description: `How to return or exchange a ${siteConfig.name} order within ${siteConfig.returnWindowDays} days.`,
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <ContentPage
      title="Returns and exchanges"
      path="/returns"
      intro={`Not quite right? You have ${siteConfig.returnWindowDays} days to send it back.`}
    >
      <h2>Our promise</h2>
      <p>
        If a piece does not fit or is not what you expected, you can return it or exchange it within{" "}
        <strong>{siteConfig.returnWindowDays} days</strong> of delivery.
      </p>

      <h2>What can be returned</h2>
      <ul>
        <li>The item is unworn, unwashed and in its original condition.</li>
        <li>All tags and packaging are still attached.</li>
        <li>You have your order number or the confirmation email.</li>
      </ul>
      <p>
        For hygiene reasons we cannot take back pieces that have been worn, washed or damaged after delivery, or pieces that were altered
        at your request beyond our standard alterations.
      </p>

      <h2>How to start a return or exchange</h2>
      <ol>
        <li>
          Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> within {siteConfig.returnWindowDays} days of delivery. Include your
          order number, the item you want to return and whether you would like a refund or a different size.
        </li>
        <li>We will reply with the return address and simple packing instructions.</li>
        <li>Pack the item securely with its tags and send it to us. Please keep the courier receipt until we confirm it has arrived.</li>
      </ol>

      <h2>Exchanges</h2>
      <p>
        Exchanges for another size or colour depend on stock. If the size you want is unavailable, we will offer a refund instead. Check the{" "}
        <Link href="/size-guide">size guide</Link> before ordering to get the fit right the first time.
      </p>

      <h2>Refunds</h2>
      <p>
        Once we have received and checked your return, we refund the amount to your original payment method. Banks and card networks can take a few
        more days to show it in your account. Original shipping charges are not refunded unless the return is because we sent the wrong or a
        faulty item.
      </p>

      <h2>Wrong or faulty items</h2>
      <p>
        If we sent the wrong item, or it arrived with a fault, tell us within 48 hours of delivery with a photo, and we will arrange a replacement or
        a full refund, including shipping, at no cost to you.
      </p>
    </ContentPage>
  );
}
