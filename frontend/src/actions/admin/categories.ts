"use server";

import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { z } from "zod";
import { failure, success, UNIQUE_VIOLATION, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().trim().min(1, { error: "Enter a name" }).max(80, { error: "Keep this under 80 characters" }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, { error: "Use lowercase letters, numbers and single dashes" }),
  description: z.string().trim().max(500, { error: "Keep this under 500 characters" }),
  imageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value), {
      error: "Enter a full image address, or leave empty",
    }),
});

export type CategoryInput = z.input<typeof categorySchema>;

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
  return fieldErrors;
}

function toRow(values: z.output<typeof categorySchema>) {
  return {
    name: values.name,
    slug: values.slug || slugify(values.name),
    description: values.description || null,
    image_url: values.imageUrl || null,
  };
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return failure("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));

  const db = createAdminSupabaseClient();
  const { data: last } = await db.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { error } = await db.from("categories").insert({ ...toRow(parsed.data), sort_order: (last?.sort_order ?? 0) + 1 });
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return failure("Another category already uses that slug.", { slug: "Already in use" });
    console.error("[admin] createCategory failed", error);
    return failure("We couldn't create the category. Please try again.");
  }

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return success("Category created.");
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return failure("Invalid category.");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return failure("Please fix the highlighted fields.", fieldErrorsFrom(parsed.error));

  const { error } = await createAdminSupabaseClient().from("categories").update(toRow(parsed.data)).eq("id", id);
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return failure("Another category already uses that slug.", { slug: "Already in use" });
    console.error("[admin] updateCategory failed", error);
    return failure("We couldn't save the category. Please try again.");
  }

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return success("Category saved.");
}

/** Moves a category one place up or down, renumbering all categories so the order is always clean. */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return failure("Invalid category.");

  const db = createAdminSupabaseClient();
  const { data, error } = await db.from("categories").select("id").order("sort_order").order("name");
  if (error) return failure("We couldn't reorder the categories. Please try again.");

  const ids = data.map((row) => row.id);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return success("Already at the end of the list.");

  [ids[index], ids[target]] = [ids[target], ids[index]];
  const results = await Promise.all(ids.map((categoryId, position) => db.from("categories").update({ sort_order: position + 1 }).eq("id", categoryId)));
  if (results.some((result) => result.error)) return failure("We couldn't reorder the categories. Please try again.");

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return success("Order updated.");
}

/** Deletes a category, but never one that still has products (active or archived). */
export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return failure("Invalid category.");

  const db = createAdminSupabaseClient();
  const { count, error: countError } = await db.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (countError) return failure("We couldn't check the category's products. Please try again.");
  if ((count ?? 0) > 0) {
    return failure(`This category still has ${count} ${count === 1 ? "product" : "products"}. Move or delete them first.`);
  }

  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteCategory failed", error);
    return failure("We couldn't delete the category. Please try again.");
  }

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return success("Category deleted.");
}
