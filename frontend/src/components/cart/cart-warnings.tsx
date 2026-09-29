import type { CartWarning } from "@/types/cart";

type CartWarningsProps = {
  warnings: CartWarning[];
  onDismiss: () => void;
};

export function CartWarnings({ warnings, onDismiss }: CartWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div role="alert" className="rounded-md border border-gold-300 bg-gold-50 p-4 text-sm text-navy-800">
      <p className="font-semibold">We updated your cart</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-navy-600">
        {warnings.map((warning, index) => (
          <li key={`${warning.variantId}-${warning.kind}-${index}`}>{warning.message}</li>
        ))}
      </ul>
      <button type="button" onClick={onDismiss} className="mt-3 text-sm font-semibold underline underline-offset-4">
        Dismiss
      </button>
    </div>
  );
}
