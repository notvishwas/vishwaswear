"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  /** Contents of the button that opens the dialog. */
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Runs when the admin confirms. The dialog stays open (with a spinner) until it finishes. */
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  triggerClassName?: string;
  triggerDisabled?: boolean;
};

/** Asks before doing something that is hard to undo, such as cancelling an order or deleting a product. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  destructive = false,
  triggerClassName,
  triggerDisabled = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button type="button" disabled={triggerDisabled} onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current && !pending) setOpen(false);
        }}
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-6 text-navy-800 backdrop:bg-navy-900/60"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p id="confirm-description" className="mt-2 text-sm leading-relaxed text-navy-500">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={pending}
            onClick={() => void confirm()}
            className={cn(destructive && "border-red-700 bg-red-700 hover:bg-red-800")}
          >
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
