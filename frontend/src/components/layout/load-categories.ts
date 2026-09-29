import "server-only";
import { cache } from "react";
import { getCategories } from "@/lib/data";
import type { Category } from "@/types";

/** Categories for navigation. Deduplicated per request; never throws so chrome can't break a page. */
export const loadNavCategories = cache(async (): Promise<Category[]> => {
  try {
    return await getCategories();
  } catch {
    return [];
  }
});
