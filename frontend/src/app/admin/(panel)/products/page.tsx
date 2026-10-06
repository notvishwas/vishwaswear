import type { Metadata } from "next";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader title="Products" description="Manage the catalogue." />
      <EmptyState
        title="Product management is the next admin task"
        description="Listing, editing and stock updates will live here, built on the same table and form components."
      />
    </>
  );
}
