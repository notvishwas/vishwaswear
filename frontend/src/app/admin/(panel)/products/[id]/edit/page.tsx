import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/page-header";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { paiseToRupees, type ProductFormInput } from "@/lib/admin/product-schema";
import { getProductForEdit, listCategoryOptions } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [product, categories] = await Promise.all([getProductForEdit(id), listCategoryOptions()]);
  if (!product) notFound();

  const initialValues: ProductFormInput = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    categoryId: product.category_id,
    price: paiseToRupees(product.price_paise),
    compareAtPrice: product.compare_at_price_paise === null ? "" : paiseToRupees(product.compare_at_price_paise),
    fabric: product.fabric ?? "",
    fit: product.fit ?? "",
    careInstructions: product.care_instructions ?? "",
    isActive: product.is_active,
    isFeatured: product.is_featured,
    variants: product.variants.map(({ id: variantId, size, color, sku, stock }) => ({ id: variantId, size, color, sku, stock })),
    images: product.images.map(({ id: imageId, url, alt }) => ({ id: imageId, url, alt })),
  };

  return (
    <>
      <PageHeader
        title={product.name}
        description={product.is_active ? "Visible in the shop." : "Hidden from the shop."}
        actions={
          product.is_active && (
            <Link href={`/product/${product.slug}`} target="_blank" className="text-sm font-medium text-navy-800 underline underline-offset-4">
              View in shop
            </Link>
          )
        }
      />
      <div className="max-w-3xl">
        {/* Remounts after every save so new variant and image ids replace the placeholders. */}
        <ProductForm
          key={product.updated_at}
          productId={product.id}
          categories={categories}
          initialValues={initialValues}
          secondaryActions={<ProductDeleteButton productId={product.id} productName={product.name} />}
        />
      </div>
    </>
  );
}
