import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const controlClasses =
  "w-full rounded-md border border-navy-200 bg-white px-3 text-navy-800 placeholder:text-navy-400 " +
  "focus-visible:border-gold-500 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:opacity-70 " +
  "aria-[invalid=true]:border-red-700";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

/** Label + hint + error wrapper shared by Input, Select and Textarea. */
export function Field({ id, label, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-navy-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
