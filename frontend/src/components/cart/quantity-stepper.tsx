import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Names the control for screen readers, e.g. the product name. */
  label: string;
  className?: string;
};

export function QuantityStepper({ value, max, onChange, disabled = false, label, className }: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={`Quantity for ${label}`}
      className={cn("inline-flex h-11 items-center rounded-md border border-navy-200 bg-white", className)}
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className="inline-flex size-11 items-center justify-center text-xl disabled:text-navy-200"
      >
        −
      </button>
      <output aria-live="polite" className="w-10 text-center text-sm font-semibold">
        {value}
      </output>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className="inline-flex size-11 items-center justify-center text-xl disabled:text-navy-200"
      >
        +
      </button>
    </div>
  );
}
