import type { Metadata } from "next";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader title="Customers" description="People who have signed up or ordered." />
      <EmptyState
        title="Customer management is the next admin task"
        description="Customer profiles and their order history will live here."
      />
    </>
  );
}
