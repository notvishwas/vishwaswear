import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { EMPTY_PRODUCT, ProductForm } from "@/components/admin/product-form";
import { listCategoryOptions } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategoryOptions();

  return (
    <>
      <PageHeader title="New product" description="Fill in the details, add photos and variants, then create it." />
      <div className="max-w-3xl">
        <ProductForm categories={categories} initialValues={EMPTY_PRODUCT} />
      </div>
    </>
  );
}
