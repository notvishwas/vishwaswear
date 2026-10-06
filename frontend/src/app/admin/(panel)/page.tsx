import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDashboardStats, getRecentOrders, type RecentOrder } from "@/lib/admin/dashboard";
import { formatCount, formatDateTime } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/shop/variants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const recentOrderColumns: Column<RecentOrder>[] = [
  { key: "order_number", header: "Order", cell: (order) => <span className="font-semibold">{order.order_number}</span> },
  { key: "email", header: "Customer", cell: (order) => order.email },
  { key: "created_at", header: "Placed", cell: (order) => formatDateTime(order.created_at) },
  { key: "status", header: "Status", cell: (order) => <StatusBadge status={order.status} /> },
  { key: "total_paise", header: "Total", align: "right", cell: (order) => formatPrice(order.total_paise) },
];

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders(10)]);

  return (
    <>
      <PageHeader title="Dashboard" description="How the store is doing right now." />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Orders today" value={formatCount(stats.today_orders)} hint="Paid today, IST" />
        <StatCard label="Revenue this month" value={formatPrice(stats.month_revenue_paise)} hint="Paid orders, IST month" />
        <StatCard label="Total orders" value={formatCount(stats.total_orders)} hint="All paid orders" />
        <StatCard
          label="Low stock"
          value={formatCount(stats.low_stock_count)}
          hint={`Variants with ${LOW_STOCK_THRESHOLD} or fewer`}
          tone={stats.low_stock_count > 0 ? "warning" : "default"}
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-orders-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-orders-heading" className="text-lg font-semibold text-navy-800">
              Recent orders
            </h2>
            <Link href="/admin/orders" className="text-sm font-medium text-navy-800 underline underline-offset-4">
              View all
            </Link>
          </div>
          <DataTable
            caption="Recent orders"
            columns={recentOrderColumns}
            rows={recentOrders}
            rowKey={(order) => order.id}
            emptyTitle="No orders yet"
            emptyDescription="Paid orders will appear here as soon as customers check out."
          />
        </section>

        <section aria-labelledby="top-products-heading">
          <h2 id="top-products-heading" className="mb-3 text-lg font-semibold text-navy-800">
            Top-selling products
          </h2>
          {stats.top_products.length === 0 ? (
            <EmptyState title="No sales yet" description="Your best sellers will be ranked here." />
          ) : (
            <ol className="divide-y divide-cream-300 rounded-md border border-cream-300 bg-white">
              {stats.top_products.map((product, index) => (
                <li key={`${product.name}-${index}`} className="flex items-center gap-3 px-4 py-3">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-500 text-xs font-semibold text-gold-700"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-800">{product.name}</p>
                    <p className="text-xs text-navy-400">
                      {formatCount(product.units)} {product.units === 1 ? "unit" : "units"} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-navy-800">{formatPrice(product.revenue_paise)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
