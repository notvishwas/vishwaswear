"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/layout/icons";
import { SIZE_CHARTS, defaultSizeChartId, type SizeChart } from "@/lib/shop/size-charts";
import { cn } from "@/lib/utils";

type SizeGuideProps = {
  categorySlug: string;
  className?: string;
  children: ReactNode;
};

/** A trigger button plus a modal size chart. The chart for the product's category opens first. */
export function SizeGuide({ categorySlug, className, children }: SizeGuideProps) {
  const [open, setOpen] = useState(false);
  const [chartId, setChartId] = useState<SizeChart["id"]>(defaultSizeChartId(categorySlug));
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const chart = SIZE_CHARTS.find((item) => item.id === chartId) ?? SIZE_CHARTS[0];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        aria-labelledby="size-guide-title"
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-lg bg-cream-100 p-0 text-navy-800 backdrop:bg-navy-900/60"
      >
        {open && (
          <div className="max-h-[85dvh] overflow-y-auto p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 id="size-guide-title" className="text-xl font-semibold">
                Size guide
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close size guide"
                className="-mr-2 -mt-2 inline-flex size-11 items-center justify-center rounded-md hover:bg-navy-800/5"
              >
                <CloseIcon />
              </button>
            </div>

            <div role="tablist" aria-label="Garment type" className="mt-4 flex flex-wrap gap-2">
              {SIZE_CHARTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={item.id === chart.id}
                  onClick={() => setChartId(item.id)}
                  className={cn(
                    "h-10 rounded-md border px-4 text-sm font-medium",
                    item.id === chart.id
                      ? "border-navy-800 bg-navy-800 text-white"
                      : "border-navy-200 bg-white hover:border-navy-800",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-navy-500">{chart.note}</p>

            <div className="mt-4 overflow-x-auto rounded-md border border-cream-300 bg-white">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <caption className="sr-only">{chart.label} size chart</caption>
                <thead className="bg-cream-200 text-xs uppercase tracking-wider text-navy-500">
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
                      <th scope="row" className="px-3 py-3 font-semibold">
                        {size}
                      </th>
                      {values.map((value, index) => (
                        <td key={index} className="px-3 py-3 text-navy-600">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
