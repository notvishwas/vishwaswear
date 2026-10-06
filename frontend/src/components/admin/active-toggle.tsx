"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { setProductActive } from "@/actions/admin/products";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

/** A switch that shows or hides a product in the shop right away. */
export function ActiveToggle({ productId, productName, active }: { productId: string; productName: string; active: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(active);

  function toggle() {
    const next = !optimisticActive;
    startTransition(async () => {
      setOptimisticActive(next);
      const result = await setProductActive(productId, next);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimisticActive}
      aria-label={`${productName} is ${optimisticActive ? "visible" : "hidden"} in the shop`}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        optimisticActive ? "border-navy-800 bg-navy-800" : "border-navy-200 bg-navy-100",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow transition-transform",
          optimisticActive ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
