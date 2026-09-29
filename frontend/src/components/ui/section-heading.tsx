import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  id,
  title,
  eyebrow,
  description,
  align = "left",
  as: Heading = "h2",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </p>
      )}
      <Heading id={id} className="text-3xl font-semibold tracking-tight text-navy-800 sm:text-4xl">
        {title}
      </Heading>
      <span aria-hidden="true" className="h-px w-12 bg-gold-500" />
      {description && (
        <p className="max-w-prose text-sm leading-relaxed text-navy-500 sm:text-base">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
