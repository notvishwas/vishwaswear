import { STATUS_LABELS } from "@/lib/orders/status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const TONES: Record<OrderStatus, string> = {
  pending_payment: "border-navy-200 bg-white text-navy-500",
  paid: "border-gold-300 bg-gold-50 text-gold-700",
  processing: "border-navy-200 bg-navy-50 text-navy-600",
  shipped: "border-sky-200 bg-sky-50 text-sky-800",
  delivered: "border-green-200 bg-green-50 text-green-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
  refunded: "border-red-200 bg-white text-red-800",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-semibold",
        TONES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
