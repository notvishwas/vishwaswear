import "server-only";
import { cache } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Category } from "@/types";

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data;
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load category: ${error.message}`);
  return data;
});
