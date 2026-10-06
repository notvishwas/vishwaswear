import type { ReactNode } from "react";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Label, hint and error wrapper for any control. Input, Select and Textarea from `components/ui`
 * already include it; use this for custom controls such as checkboxes, toggles and image pickers.
 */
export function FormField(props: FormFieldProps) {
  return <Field {...props} />;
}

/** A titled card that groups related fields in an admin form. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-md border border-cream-300 bg-white p-4 sm:p-6", className)}>
      <h2 className="text-base font-semibold text-navy-800">{title}</h2>
      {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Right-aligned row for a form's submit and cancel buttons. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>;
}
