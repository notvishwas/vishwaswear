import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateTime } from "@/lib/admin/format";
import { CUSTOMER_SORT_KEYS, listCustomers, type AdminCustomerRow, type CustomerSortKey } from "@/lib/admin/customers";
import { parseTableQuery } from "@/lib/admin/table";
import { requireAdmin } from "@/lib/auth/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

const columns: Column<AdminCustomerRow>[] = [
  { key: "name", header: "Name", sortable: true, cell: (customer) => <span className="font-semibold">{customer.name || "Unknown"}</span> },
  { key: "email", header: "Email", sortable: true, cell: (customer) => customer.email },
  { key: "order_count", header: "Orders", sortable: true, align: "right", cell: (customer) => customer.order_count },
  { key: "total_spent_paise", header: "Total spent", sortable: true, align: "right", cell: (customer) => formatPrice(customer.total_spent_paise) },
  { key: "last_order_at", header: "Last order", sortable: true, cell: (customer) => formatDateTime(customer.last_order_at) },
];

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin();
  const query = parseTableQuery<CustomerSortKey>(await searchParams, { sortKeys: CUSTOMER_SORT_KEYS, defaultSort: "last_order_at" });
  const result = await listCustomers(query);

  return (
    <>
      <PageHeader title="Customers" description="Everyone who has paid for an order, grouped by email. Spend counts paid orders only." />
      <DataTable
        caption="Customers"
        columns={columns}
        rows={result.items}
        rowKey={(customer) => customer.email}
        emptyTitle="No customers yet"
        emptyDescription="Customers appear here after their first paid order."
        controls={{
          basePath: "/admin/customers",
          query,
          total: result.total,
          totalPages: result.totalPages,
          pageSize: result.pageSize,
          searchPlaceholder: "Search by name or email",
        }}
      />
    </>
  );
}
