import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/admin/page-header";
import { listCategoriesWithCounts } from "@/lib/admin/categories";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategoriesWithCounts();

  return (
    <>
      <PageHeader title="Categories" description="The order here is the order shown in the shop menu." />
      <div className="max-w-3xl">
        <CategoryManager categories={categories} />
      </div>
    </>
  );
}
