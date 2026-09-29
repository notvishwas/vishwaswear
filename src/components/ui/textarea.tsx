import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClasses, describedBy, Field } from "./field";

type TextareaProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ id, label, error, hint, className, rows = 4, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClasses, "py-2.5")}
        {...props}
      />
    </Field>
  );
}
