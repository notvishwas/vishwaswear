"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { failure, success, UNIQUE_VIOLATION, type ActionResult } from "@/lib/admin/action-result";
import { productFormSchema, rupeesToPaise, type ProductFormInput } from "@/lib/admin/product-schema";
import { removeProductImageFiles } from "@/lib/admin/storage";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const saveSchema = z.object({ id: z.uuid().optional(), values: productFormSchema });

export type SaveProductInput = { id?: string; values: ProductFormInput };

function describeConflict(message: string): { text: string; field: string } {
  if (message.includes("slug")) return { text: "Another product already uses that slug.", field: "slug" };
  if (message.includes("sku")) return { text: "One of the SKUs is already used by another product.", field: "variants" };
  return { text: "That size and colour is already listed for this product.", field: "variants" };
}

/** Creates or updates a product with its variants and images in one database transaction. */
export async function saveProduct(input: SaveProductInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return failure("Please fix the highlighted fields.", fieldErrors);
  }
  const { id, values } = parsed.data;
  const db = createAdminSupabaseClient();

  // Remember the current images so files for removed ones can be deleted afterwards.
  let previousUrls: string[] = [];
  if (id) {
    const { data } = await db.from("product_images").select("url").eq("product_id", id);
    previousUrls = (data ?? []).map((row) => row.url);
  }

  const { data: productId, error } = await db.rpc("admin_save_product", {
    p_id: id ?? null,
    p_product: {
      category_id: values.categoryId,
      name: values.name,
      slug: values.slug,
      description: values.description,
      price_paise: rupeesToPaise(values.price),
      compare_at_price_paise: values.compareAtPrice === "" ? null : rupeesToPaise(values.compareAtPrice),
      fabric: values.fabric,
      fit: values.fit,
      care_instructions: values.careInstructions,
      is_active: values.isActive,
      is_featured: values.isFeatured,
    },
    p_variants: values.variants.map(({ id: variantId, size, color, sku, stock }) => ({ id: variantId ?? null, size, color, sku, stock })),
    p_images: values.images.map(({ id: imageId, url, alt }) => ({ id: imageId ?? null, url, alt })),
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      const conflict = describeConflict(error.message);
      return failure(conflict.text, { [conflict.field]: conflict.text });
    }
    if (error.code === "P0002") return failure("That product no longer exists.");
    console.error("[admin] saveProduct failed", error);
    return failure("We couldn't save the product. Please try again.");
  }

  const keptUrls = new Set(values.images.map((image) => image.url));
  await removeProductImageFiles(previousUrls.filter((url) => !keptUrls.has(url)));

  revalidatePath("/admin/products");
  return success(id ? "Product saved." : "Product created.", { id: productId });
}

/** Shows or hides a product in the shop without touching anything else. */
export async function setProductActive(productId: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(productId).success) return failure("Invalid product.");

  const { error } = await createAdminSupabaseClient().from("products").update({ is_active: active }).eq("id", productId);
  if (error) {
    console.error("[admin] setProductActive failed", error);
    return failure("We couldn't update the product. Please try again.");
  }

  revalidatePath("/admin/products");
  return success(active ? "Product is now visible in the shop." : "Product hidden from the shop.");
}

/**
 * Deletes a product, unless it appears in past orders, in which case it is archived (hidden from the
 * shop) so order history and reports stay intact.
 */
export async function deleteProduct(productId: string): Promise<ActionResult<{ archived: boolean }>> {
  await requireAdmin();
  if (!z.uuid().safeParse(productId).success) return failure("Invalid product.");
  const db = createAdminSupabaseClient();

  const { count, error: countError } = await db
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (countError) {
    console.error("[admin] deleteProduct count failed", countError);
    return failure("We couldn't check the product's order history. Please try again.");
  }

  if ((count ?? 0) > 0) {
    const { error } = await db.from("products").update({ is_active: false, is_featured: false }).eq("id", productId);
    if (error) return failure("We couldn't archive the product. Please try again.");
    revalidatePath("/admin/products");
    return success("This product appears in past orders, so it was archived instead of deleted.", { archived: true });
  }

  const { data: images } = await db.from("product_images").select("url").eq("product_id", productId);
  const { error } = await db.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[admin] deleteProduct failed", error);
    return failure("We couldn't delete the product. Please try again.");
  }

  await removeProductImageFiles((images ?? []).map((row) => row.url));
  revalidatePath("/admin/products");
  return success("Product deleted.", { archived: false });
}
