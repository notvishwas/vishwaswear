import type { Metadata } from "next";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader title="Categories" description="Organise the catalogue." />
      <EmptyState
        title="Category management is the next admin task"
        description="Adding, ordering and editing categories will live here."
      />
    </>
  );
}
