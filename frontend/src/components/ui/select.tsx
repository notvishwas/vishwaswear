import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClasses, describedBy, Field } from "./field";

type SelectProps = Omit<ComponentProps<"select">, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function Select({ id, label, error, hint, className, children, ...props }: SelectProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClasses, "h-11")}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
