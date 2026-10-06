"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { saveProduct } from "@/actions/admin/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { productFormSchema, type ProductFormInput, type ProductFormValues } from "@/lib/admin/product-schema";
import { slugify } from "@/lib/utils";
import { FormActions, FormField, FormSection } from "./form-field";
import { ProductImagesField } from "./product-images-field";
import { ProductVariantsField } from "./product-variants-field";
import { useToast } from "./toast";

type ProductFormProps = {
  /** Present when editing; omitted when creating. */
  productId?: string;
  categories: { id: string; name: string }[];
  initialValues: ProductFormInput;
  /** Extra controls on the right of the action row, such as Delete. */
  secondaryActions?: React.ReactNode;
};

export const EMPTY_PRODUCT: ProductFormInput = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  price: "",
  compareAtPrice: "",
  fabric: "",
  fit: "",
  careInstructions: "",
  isActive: true,
  isFeatured: false,
  variants: [{ size: "", color: "", sku: "", stock: 0 }],
  images: [],
};

export function ProductForm({ productId, categories, initialValues, secondaryActions }: ProductFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [slugEdited, setSlugEdited] = useState(Boolean(productId));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const nameField = register("name");
  const slugField = register("slug");

  async function onSubmit(values: ProductFormValues) {
    const result = await saveProduct({ id: productId, values });

    if (!result.ok) {
      toast.error(result.message);
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(path as FieldPath<ProductFormInput>, { message });
      }
      return;
    }

    toast.success(result.message);
    if (productId) router.refresh();
    else router.push(`/admin/products/${result.id}/edit`);
  }

  const imagesError = typeof errors.images?.message === "string" ? errors.images.message : undefined;

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="flex flex-col gap-6">
      <FormSection title="Basics">
        <Input
          id="name"
          label="Name"
          placeholder="Charcoal Wool Two-Piece Suit"
          error={errors.name?.message}
          {...nameField}
          onChange={(event) => {
            void nameField.onChange(event);
            if (!slugEdited) setValue("slug", slugify(event.target.value), { shouldValidate: true });
          }}
        />
        <Input
          id="slug"
          label="Slug"
          hint="The product's web address: /product/your-slug. Filled in from the name; edit it if you like."
          error={errors.slug?.message}
          {...slugField}
          onChange={(event) => {
            setSlugEdited(true);
            void slugField.onChange(event);
          }}
        />
        <Textarea id="description" label="Description" rows={5} error={errors.description?.message} {...register("description")} />
        <Select id="categoryId" label="Category" error={errors.categoryId?.message} {...register("categoryId")}>
          <option value="">Choose a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormSection>

      <FormSection title="Price" description="In rupees. Add a compare-at price to show a sale.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="price" label="Price (₹)" inputMode="decimal" placeholder="12999" error={errors.price?.message} {...register("price")} />
          <Input
            id="compareAtPrice"
            label="Compare-at price (₹, optional)"
            inputMode="decimal"
            placeholder="15999"
            error={errors.compareAtPrice?.message}
            {...register("compareAtPrice")}
          />
        </div>
      </FormSection>

      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="fabric" label="Fabric" placeholder="100% Super 110s wool" error={errors.fabric?.message} {...register("fabric")} />
          <Input id="fit" label="Fit" placeholder="Tailored fit" error={errors.fit?.message} {...register("fit")} />
        </div>
        <Textarea id="careInstructions" label="Care instructions" rows={3} error={errors.careInstructions?.message} {...register("careInstructions")} />
      </FormSection>

      <FormSection title="Images" description="Drag to reorder, or use the arrows. Describe each photo in the alt text for accessibility and search.">
        <ProductImagesField control={control} register={register} getValues={getValues} error={imagesError} />
      </FormSection>

      <FormSection title="Sizes, colours and stock" description="Each row is one variant customers can buy. SKUs must be unique across the whole store.">
        <ProductVariantsField control={control} register={register} errors={errors} />
      </FormSection>

      <FormSection title="Visibility">
        <FormField id="isActive" label="Visible in the shop">
          <label className="flex items-center gap-3 text-sm text-navy-800">
            <input id="isActive" type="checkbox" className="size-5 accent-navy-800" {...register("isActive")} />
            Customers can see and buy this product
          </label>
        </FormField>
        <FormField id="isFeatured" label="Featured">
          <label className="flex items-center gap-3 text-sm text-navy-800">
            <input id="isFeatured" type="checkbox" className="size-5 accent-navy-800" {...register("isFeatured")} />
            Show on the homepage featured section
          </label>
        </FormField>
      </FormSection>

      <FormActions>
        {secondaryActions}
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Back to products
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {productId ? "Save changes" : "Create product"}
        </Button>
      </FormActions>
    </form>
  );
}
