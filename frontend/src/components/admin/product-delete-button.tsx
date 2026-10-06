"use client";

import { useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/admin/products";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast";

/** Deletes a product, or archives it when it appears in past orders (the server decides). */
export function ProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const toast = useToast();

  async function remove() {
    const result = await deleteProduct(productId);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger="Delete product"
      title={`Delete ${productName}?`}
      description="If this product appears in past orders it will be archived (hidden from the shop) instead, so your order history stays intact. Otherwise it is removed for good, along with its images."
      confirmLabel="Delete"
      destructive
      onConfirm={remove}
      triggerClassName="inline-flex h-11 items-center justify-center rounded-md border border-red-700 px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
    />
  );
}
