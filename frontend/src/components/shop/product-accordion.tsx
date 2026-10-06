import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { SizeGuide } from "./size-guide";

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details name="product-info" className="group border-b border-cream-300">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-sm font-semibold text-navy-800 marker:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-xl font-normal text-gold-700 group-open:hidden">
          +
        </span>
        <span aria-hidden="true" className="hidden text-xl font-normal text-gold-700 group-open:inline">
          −
        </span>
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-navy-500">{children}</div>
    </details>
  );
}

type ProductAccordionProps = {
  product: Pick<Product, "fabric" | "fit" | "care_instructions">;
  categorySlug: string;
};

export function ProductAccordion({ product, categorySlug }: ProductAccordionProps) {
  const details = [
    { label: "Fabric", value: product.fabric },
    { label: "Fit", value: product.fit },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="border-t border-cream-300">
      {details.length > 0 && (
        <Item title="Details">
          <dl className="grid grid-cols-[6rem_1fr] gap-y-2">
            {details.map((row) => (
              <div key={row.label} className="contents">
                <dt className="font-medium text-navy-800">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </Item>
      )}

      {product.care_instructions && <Item title="Care instructions">{product.care_instructions}</Item>}

      <Item title="Shipping and returns">
        <p>
          Shipping is free on orders above {formatPrice(siteConfig.freeShippingThresholdPaise)}. Below that,
          the shipping charge is shown at checkout before you pay.
        </p>
        <p className="mt-3">
          Unworn pieces with their tags can be returned within {siteConfig.returnWindowDays} days for a refund
          or exchange. Write to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="underline underline-offset-4">
            {siteConfig.supportEmail}
          </a>{" "}
          to start a return.
        </p>
      </Item>

      <Item title="Size guide">
        <p>Not sure of your size? Compare your measurements with our chart.</p>
        <SizeGuide
          categorySlug={categorySlug}
          className="mt-3 inline-flex h-10 items-center rounded-md border border-navy-800 px-4 text-sm font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
        >
          Open size chart
        </SizeGuide>
      </Item>
    </div>
  );
}
