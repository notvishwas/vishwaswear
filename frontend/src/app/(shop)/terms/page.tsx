import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms that apply when you browse and buy from ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of service"
      path="/terms"
      meta="Last updated 6 October 2026"
      intro={`By using this website and placing an order with ${siteConfig.name}, you agree to these terms.`}
    >
      <h2>Using the site</h2>
      <p>
        You may use this site for lawful, personal shopping. You must not misuse it, attempt to disrupt it, access areas you are not authorised to use, or use
        automated tools to copy its content or place orders.
      </p>

      <h2>Products and pricing</h2>
      <ul>
        <li>All prices are in Indian rupees (INR).</li>
        <li>We take care to describe products and show colours accurately, but screens differ, so slight variations are possible.</li>
        <li>We may change prices or remove products at any time. The price you pay is the price shown when you complete checkout.</li>
        <li>If we find a pricing or stock error after you order, we will contact you and either correct the order or refund you in full.</li>
      </ul>

      <h2>Orders and payment</h2>
      <p>
        When you place an order you make an offer to buy. We accept it when your payment is confirmed and we send your confirmation email. We may decline or
        cancel an order, for example if an item is out of stock or we suspect fraud, and we will refund any payment taken. Payments are processed securely by
        Razorpay.
      </p>

      <h2>Delivery, returns and exchanges</h2>
      <p>
        Delivery is described on our <Link href="/shipping">shipping and delivery</Link> page, and returns and exchanges on our <Link href="/returns">returns and exchanges</Link>{" "}
        page. Both form part of these terms.
      </p>

      <h2>Your account</h2>
      <p>
        If you sign in, you are responsible for keeping your account secure and for what happens under it. Tell us right away if you think someone else has used it.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The text, images, logos and design on this site belong to {siteConfig.name} or its licensors. You may not copy or reuse them without our written permission.
      </p>

      <h2>Limit of liability</h2>
      <p>
        We provide the site and products with reasonable care. To the extent the law allows, we are not liable for indirect or consequential losses, and our total
        liability for any order is limited to the amount you paid for it. Nothing in these terms limits rights you have under Indian consumer protection law.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle your personal information is explained in our <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute.</p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms from time to time; the date above shows when they last changed. Questions? Email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </ContentPage>
  );
}
