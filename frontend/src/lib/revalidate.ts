import { revalidatePath } from "next/cache";

/**
 * Refreshes every cached storefront page (home, product pages, navigation). Call it after anything
 * that changes what shoppers see: catalogue edits, price or stock changes.
 */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
