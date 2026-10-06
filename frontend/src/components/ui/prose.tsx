import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Readable long-form text (policies, about page) styled to match the design system. */
export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-base leading-relaxed text-navy-600",
        "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-navy-800",
        "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-navy-800",
        "[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_a]:font-medium [&_a]:text-navy-800 [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-navy-800",
        className,
      )}
      {...props}
    />
  );
}
