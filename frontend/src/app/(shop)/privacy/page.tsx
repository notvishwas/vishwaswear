import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy policy"
      path="/privacy"
      meta="Last updated 6 October 2026"
      intro={`${siteConfig.name} respects your privacy. This page explains what we collect, why, and the choices you have.`}
    >
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Order details:</strong> your name, email address, mobile number, delivery address and the items you buy.
        </li>
        <li>
          <strong>Account details:</strong> if you sign in with Google, your name and email address from your Google account. We never see your Google password.
        </li>
        <li>
          <strong>Messages:</strong> anything you send through the contact form or by email.
        </li>
        <li>
          <strong>Newsletter:</strong> your email address, if you subscribe.
        </li>
        <li>
          <strong>Technical data:</strong> basic information such as your IP address, used for security and to limit abuse.
        </li>
      </ul>
      <p>Your card, UPI and bank details are entered with Razorpay, our payment provider. They are never stored on our servers.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To process, deliver and support your orders, including emails about their status.</li>
        <li>To let you sign in and see your past orders.</li>
        <li>To reply to your questions.</li>
        <li>To send the newsletter, only if you subscribed. You can opt out at any time.</li>
        <li>To prevent fraud and keep the site secure.</li>
        <li>To meet legal, tax and accounting obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>We do not sell your personal information. We share it only with the services that help us run the store:</p>
      <ul>
        <li>Razorpay, to take payments.</li>
        <li>Supabase, which stores our database and handles sign-in.</li>
        <li>Resend, which delivers our emails.</li>
        <li>Our hosting provider, and the courier that delivers your order.</li>
      </ul>
      <p>These providers may process your information on servers outside India. We only use providers that protect it appropriately.</p>

      <h2>Cookies and local storage</h2>
      <p>
        We use a small number of essential cookies to keep you signed in, and your browser&apos;s local storage to remember the items in your cart. We do not use
        advertising or cross-site tracking cookies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep order records for as long as the law requires for tax and accounting. Newsletter details are kept until you unsubscribe. Messages are kept
        only as long as needed to help you.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see the personal information we hold about you, correct it, or have it deleted, subject to what we must keep by law. You can also withdraw
        consent for marketing emails at any time by replying &ldquo;unsubscribe&rdquo; to any newsletter. To make a request, email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>Security</h2>
      <p>
        We use encrypted connections, restrict access to customer data and rely on providers that follow industry security practices. No system is completely
        risk free, but we work to protect your information and will tell you if a breach affects you.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy we will update the date at the top of this page. For significant changes we will let you know by email or a notice on the
        site.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> or use our{" "}
        <Link href="/contact">contact form</Link>.
      </p>
    </ContentPage>
  );
}
