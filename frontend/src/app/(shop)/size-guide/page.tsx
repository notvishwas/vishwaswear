import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/layout/content-page";
import { siteConfig } from "@/config/site";
import { SIZE_CHARTS } from "@/lib/shop/size-charts";

export const metadata: Metadata = {
  title: "Size guide",
  description: `Body measurement charts for ${siteConfig.name} suits, blazers, shirts and trousers, in inches and centimetres.`,
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <ContentPage
      title="Size guide"
      path="/size-guide"
      intro="Measure yourself, find your size, and order with confidence."
    >
      <h2>How to measure</h2>
      <ul>
        <li>
          <strong>Chest:</strong> around the fullest part of your chest, just under the arms, keeping the tape level.
        </li>
        <li>
          <strong>Waist:</strong> around your natural waistline, where your trousers usually sit.
        </li>
        <li>
          <strong>Neck:</strong> around the base of the neck, with one finger between the tape and your skin.
        </li>
        <li>
          <strong>Shoulder:</strong> from the edge of one shoulder to the other, across your back.
        </li>
        <li>
          <strong>Sleeve:</strong> from the shoulder seam to your wrist bone, with your arm slightly bent.
        </li>
        <li>
          <strong>Inseam:</strong> from the crotch seam down the inside of the leg to where you want the trouser to end.
        </li>
      </ul>
      <p>
        Measure over light clothing, keep the tape snug but not tight, and ask a friend to help if you can. All measurements are body
        measurements, not garment measurements.
      </p>

      {SIZE_CHARTS.map((chart) => (
        <section key={chart.id} aria-labelledby={`chart-${chart.id}`}>
          <h2 id={`chart-${chart.id}`}>{chart.label}</h2>
          <p>{chart.note}</p>
          <div className="mb-6 overflow-x-auto rounded-md border border-cream-300 bg-white">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <caption className="sr-only">{chart.label} size chart</caption>
              <thead className="bg-cream-200 text-xs uppercase tracking-wider text-navy-600">
                <tr>
                  {chart.columns.map((column) => (
                    <th key={column} scope="col" className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map(([size, ...values]) => (
                  <tr key={size} className="border-t border-cream-300">
                    <th scope="row" className="px-3 py-3 font-semibold text-navy-800">
                      {size}
                    </th>
                    {values.map((value, index) => (
                      <td key={index} className="px-3 py-3">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <h2>Between sizes?</h2>
      <p>
        If you fall between two sizes, size up for jackets and coats if you like layering, and size down for shirts if you prefer a closer fit. We include
        basic alterations on suits, blazers and trousers, and you can always <Link href="/contact">ask us</Link> for advice. Our{" "}
        <Link href="/returns">returns policy</Link> covers a wrong fit.
      </p>
    </ContentPage>
  );
}
