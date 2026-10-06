import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/admin/format";
import {
  ORDER_SORT_KEYS,
  ORDER_STATUS_FILTERS,
  listOrders,
  type AdminOrderRow,
  type OrderSortKey,
} from "@/lib/admin/orders";
import { buildTableHref, parseTableQuery } from "@/lib/admin/table";
import { requireAdmin } from "@/lib/auth/admin";
import { STATUS_LABELS } from "@/lib/orders/status";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Orders" };

const columns: Column<AdminOrderRow>[] = [
  { key: "order_number", header: "Order", sortable: true, cell: (order) => (
      <Link href={`/admin/orders/${order.id}`} className="font-semibold underline-offset-4 hover:underline">
        {order.order_number}
      </Link>
    ),
  },
  { key: "email", header: "Customer", cell: (order) => order.email },
  { key: "created_at", header: "Placed", sortable: true, cell: (order) => formatDateTime(order.created_at) },
  { key: "status", header: "Status", sortable: true, cell: (order) => <StatusBadge status={order.status} /> },
  { key: "total_paise", header: "Total", sortable: true, align: "right", cell: (order) => formatPrice(order.total_paise) },
];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const raw = await searchParams;

  const query = parseTableQuery<OrderSortKey>(raw, { sortKeys: ORDER_SORT_KEYS, defaultSort: "created_at" });
  const statusParam = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = ORDER_STATUS_FILTERS.find((value) => value === statusParam);

  const result = await listOrders(query, status);
  const extraParams = { status };

  return (
    <>
      <PageHeader title="Orders" description="Every order placed in the store." />

      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUS_FILTERS].map((value: OrderStatus | undefined) => (
          <Link
            key={value ?? "all"}
            href={buildTableHref("/admin/orders", { q: query.q, sort: query.sort, dir: query.dir }, { status: value })}
            aria-current={value === status ? "true" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium",
              value === status
                ? "border-navy-800 bg-navy-800 text-white"
                : "border-navy-200 bg-white text-navy-800 hover:border-navy-800",
            )}
          >
            {value ? STATUS_LABELS[value] : "All"}
          </Link>
        ))}
      </nav>

      <DataTable
        caption="Orders"
        columns={columns}
        rows={result.items}
        rowKey={(order) => order.id}
        emptyTitle="No orders match"
        emptyDescription="Orders will appear here once customers check out."
        controls={{
          basePath: "/admin/orders",
          query,
          total: result.total,
          totalPages: result.totalPages,
          pageSize: result.pageSize,
          searchPlaceholder: "Search by order number or email",
          extraParams,
        }}
      />
    </>
  );
}
