import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";

const promises = [
  {
    title: "Free shipping",
    body: `On every order above ${formatPrice(siteConfig.freeShippingThresholdPaise)}, delivered across India.`,
  },
  {
    title: "Easy returns",
    body: `Unworn pieces can be returned within ${siteConfig.returnWindowDays} days for a refund or exchange.`,
  },
  {
    title: "Secure payment",
    body: "Pay by UPI, card or net banking through Razorpay. We never see or store your card details.",
  },
  {
    title: "Made-to-fit alterations",
    body: "Hemming and sleeve adjustments on suits, blazers and trousers, so the fit is right from day one.",
  },
];

export function BrandPromise() {
  return (
    <section aria-label="Our promise" className="border-y border-cream-300 bg-cream-200 py-12 sm:py-14">
      <Container>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((promise) => (
            <li key={promise.title} className="flex flex-col gap-2 border-t border-gold-500 pt-4">
              <h3 className="text-base font-semibold text-navy-800">{promise.title}</h3>
              <p className="text-sm leading-relaxed text-navy-500">{promise.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
