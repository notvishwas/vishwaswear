import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About us",
  description: `The story behind ${siteConfig.name}: well-made menswear, honest pricing and a fit you can rely on.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About us"
      path="/about"
      intro={`${siteConfig.name} makes tailored menswear for men who want to look sharp without making a production of it.`}
    >
      <p>
        We sell suits, blazers, coats, trousers and shirts, the pieces a man reaches for at work, at weddings and on the days
        in between. Everything in the collection is chosen for three things: the fabric, the cut and how it holds up after the
        tenth wear, not just the first.
      </p>

      <h2>Fabric first</h2>
      <p>
        A good garment starts with good cloth. We work with wool, wool blends, cotton and linen that suit Indian weather and Indian
        wardrobes: light enough for a long day, structured enough to keep its shape. Every product page tells you exactly what a piece
        is made from and how to look after it.
      </p>

      <h2>A fit you can trust</h2>
      <p>
        Buying clothes online is only as good as the size chart behind it. Ours lists real body measurements in inches and
        centimetres for every garment type, and we include basic alterations such as hemming and sleeve adjustments on suits,
        blazers and trousers so the fit is right from the first wear. If you are between sizes, write to us and we will help you
        choose.
      </p>

      <h2>Fair, simple and clear</h2>
      <ul>
        <li>Prices are shown in rupees, with no surprises at checkout.</li>
        <li>Delivery is free on larger orders, and the shipping charge is always shown before you pay.</li>
        <li>Easy returns within {siteConfig.returnWindowDays} days if a piece is not right.</li>
        <li>Payments are handled by Razorpay, so your card details never touch our servers.</li>
      </ul>

      <h2>Talk to us</h2>
      <p>
        Questions about sizing, fabric or an order? Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> or use
        the <Link href="/contact">contact form</Link>. A real person reads every message.
      </p>
    </ContentPage>
  );
}
