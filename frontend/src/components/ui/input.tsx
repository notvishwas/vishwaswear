import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClasses, describedBy, Field } from "./field";

type InputProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ id, label, error, hint, className, ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClasses, "h-11")}
        {...props}
      />
    </Field>
  );
}
