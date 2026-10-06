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
  /** A server action to run on confirm. It receives the hidden `fields` as form data. */
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  destructive?: boolean;
  triggerClassName?: string;
};

/** Asks before doing something that is hard to undo, such as cancelling an order or deleting a product. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  action,
  fields = {},
  destructive = false,
  triggerClassName,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
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

        <form action={action} className="mt-6 flex justify-end gap-3">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" className={cn(destructive && "border-red-700 bg-red-700 hover:bg-red-800")}>
            {confirmLabel}
          </Button>
        </form>
      </dialog>
    </>
  );
}
