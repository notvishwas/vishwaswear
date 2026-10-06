import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { PRODUCT_SORT_KEYS, listProducts, type AdminProductRow, type ProductSortKey } from "@/lib/admin/products";
import { parseTableQuery } from "@/lib/admin/table";
import { requireAdmin } from "@/lib/auth/admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/shop/variants";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const columns: Column<AdminProductRow>[] = [
  {
    key: "image",
    header: "Image",
    cell: (product) => (
      <div className="relative aspect-[4/5] w-10 overflow-hidden rounded-sm bg-cream-200">
        {product.imageUrl && <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="40px" className="object-cover" />}
      </div>
    ),
  },
  {
    key: "name",
    header: "Name",
    sortable: true,
    cell: (product) => (
      <Link href={`/admin/products/${product.id}/edit`} className="font-semibold underline-offset-4 hover:underline">
        {product.name}
      </Link>
    ),
  },
  { key: "category", header: "Category", cell: (product) => product.categoryName },
  { key: "price_paise", header: "Price", sortable: true, align: "right", cell: (product) => formatPrice(product.price_paise) },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    cell: (product) => (
      <span className={cn(product.totalStock <= LOW_STOCK_THRESHOLD && "font-semibold text-red-700")}>{product.totalStock}</span>
    ),
  },
  {
    key: "active",
    header: "Visible",
    cell: (product) => <ActiveToggle productId={product.id} productName={product.name} active={product.is_active} />,
  },
];

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const query = parseTableQuery<ProductSortKey>(await searchParams, { sortKeys: PRODUCT_SORT_KEYS, defaultSort: "created_at" });
  const result = await listProducts(query);

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything in the catalogue, visible or hidden."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center rounded-md border border-navy-800 bg-navy-800 px-5 text-sm font-semibold text-white hover:bg-navy-700"
          >
            Add product
          </Link>
        }
      />
      <DataTable
        caption="Products"
        columns={columns}
        rows={result.items}
        rowKey={(product) => product.id}
        emptyTitle="No products yet"
        emptyDescription="Add your first product to start selling."
        controls={{
          basePath: "/admin/products",
          query,
          total: result.total,
          totalPages: result.totalPages,
          pageSize: result.pageSize,
          searchPlaceholder: "Search by name or slug",
        }}
      />
    </>
  );
}
