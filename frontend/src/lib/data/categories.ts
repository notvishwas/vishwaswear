import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load category: ${error.message}`);
  return data;
}
