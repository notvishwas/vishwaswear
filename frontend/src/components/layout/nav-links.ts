import type { Category } from "@/types";

export type NavLink = { label: string; href: string };

/** Shop plus one link per category, in category sort order. */
export function buildNavLinks(categories: Pick<Category, "name" | "slug">[]): NavLink[] {
  return [
    { label: "Shop", href: "/shop" },
    ...categories.map((category) => ({
      label: category.name,
      href: `/shop/${category.slug}`,
    })),
  ];
}
