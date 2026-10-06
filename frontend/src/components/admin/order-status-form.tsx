"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { nextStatuses, restoresStock } from "@/lib/orders/transitions";
import { STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast";

type StatusChoice = "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

const CHOICES: StatusChoice[] = ["processing", "shipped", "delivered", "cancelled", "refunded"];

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const options = nextStatuses(currentStatus).filter((status): status is StatusChoice => CHOICES.includes(status as StatusChoice));
  const [status, setStatus] = useState<StatusChoice | "">("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (options.length === 0) {
    return (
      <p className="text-sm text-navy-500">
        This order is {STATUS_LABELS[currentStatus].toLowerCase()}, so its status can&apos;t be changed any more.
      </p>
    );
  }

  async function submit() {
    if (!status) return;
    const result = await updateOrderStatus({ orderId, status, courierName, trackingNumber, trackingUrl });
    if (result.ok) {
      toast.success(result.message);
      setStatus("");
      setErrors({});
      startTransition(() => router.refresh());
    } else {
      toast.error(result.message);
      setErrors(result.fieldErrors ?? {});
    }
  }

  const destructive = status !== "" && restoresStock(status);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!destructive) void submit();
      }}
      className="flex flex-col gap-4"
    >
      <Select
        id="status"
        label="Change status to"
        value={status}
        onChange={(event) => setStatus(event.target.value as StatusChoice | "")}
      >
        <option value="">Choose a status…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </Select>

      {status === "shipped" && (
        <>
          <Input
            id="courierName"
            label="Courier name"
            placeholder="Delhivery"
            value={courierName}
            onChange={(event) => setCourierName(event.target.value)}
            error={errors.courierName}
            required
          />
          <Input
            id="trackingNumber"
            label="Tracking number (optional)"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            error={errors.trackingNumber}
          />
          <Input
            id="trackingUrl"
            label="Tracking link (optional)"
            type="url"
            placeholder="https://"
            value={trackingUrl}
            onChange={(event) => setTrackingUrl(event.target.value)}
            error={errors.trackingUrl}
            hint="The customer is emailed these details."
          />
        </>
      )}

      {destructive && (
        <p role="note" className="rounded-md border border-gold-300 bg-gold-50 p-3 text-sm text-navy-800">
          The items go back into stock. This can&apos;t be undone, and the payment is not refunded automatically: refund it
          from the Razorpay dashboard.
        </p>
      )}

      {destructive ? (
        <ConfirmDialog
          trigger={status === "cancelled" ? "Cancel order" : "Mark as refunded"}
          title={status === "cancelled" ? "Cancel this order?" : "Mark this order as refunded?"}
          description="Its items will be put back into stock and the order can't be changed afterwards."
          confirmLabel={status === "cancelled" ? "Cancel order" : "Mark as refunded"}
          destructive
          onConfirm={submit}
          triggerClassName="inline-flex h-11 items-center justify-center rounded-md border border-red-700 bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800"
        />
      ) : (
        <Button type="submit" disabled={!status} loading={pending}>
          Update status
        </Button>
      )}
    </form>
  );
}
