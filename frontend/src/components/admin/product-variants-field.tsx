"use client";

import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { ProductFormInput } from "@/lib/admin/product-schema";

type ProductVariantsFieldProps = {
  control: Control<ProductFormInput>;
  register: UseFormRegister<ProductFormInput>;
  errors: FieldErrors<ProductFormInput>;
};

const inputClasses =
  "h-10 w-full rounded-md border border-navy-200 bg-white px-3 text-sm focus-visible:border-gold-500 aria-[invalid=true]:border-red-700";

/** One row per size and colour, each with its own SKU and stock count. */
export function ProductVariantsField({ control, register, errors }: ProductVariantsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "variants", keyName: "fieldKey" });
  const listError = errors.variants?.root?.message ?? (typeof errors.variants?.message === "string" ? errors.variants.message : undefined);

  return (
    <div>
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
          Add at least one size and colour so customers can buy this product.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const rowErrors = errors.variants?.[index];
            return (
              <li key={field.fieldKey} className="rounded-md border border-cream-300 bg-cream-100 p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1.2fr_1.6fr_6rem_auto] sm:items-start">
                  <div>
                    <label htmlFor={`variant-size-${index}`} className="text-xs font-medium text-navy-600">
                      Size
                    </label>
                    <input
                      id={`variant-size-${index}`}
                      placeholder="40"
                      aria-invalid={rowErrors?.size ? true : undefined}
                      className={`${inputClasses} mt-1`}
                      {...register(`variants.${index}.size`)}
                    />
                    {rowErrors?.size && <p role="alert" className="mt-1 text-xs text-red-700">{rowErrors.size.message}</p>}
                  </div>
                  <div>
                    <label htmlFor={`variant-color-${index}`} className="text-xs font-medium text-navy-600">
                      Colour
                    </label>
                    <input
                      id={`variant-color-${index}`}
                      placeholder="Navy"
                      aria-invalid={rowErrors?.color ? true : undefined}
                      className={`${inputClasses} mt-1`}
                      {...register(`variants.${index}.color`)}
                    />
                    {rowErrors?.color && <p role="alert" className="mt-1 text-xs text-red-700">{rowErrors.color.message}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`variant-sku-${index}`} className="text-xs font-medium text-navy-600">
                      SKU
                    </label>
                    <input
                      id={`variant-sku-${index}`}
                      placeholder="NHB-NAV-40"
                      aria-invalid={rowErrors?.sku ? true : undefined}
                      className={`${inputClasses} mt-1 uppercase`}
                      {...register(`variants.${index}.sku`)}
                    />
                    {rowErrors?.sku && <p role="alert" className="mt-1 text-xs text-red-700">{rowErrors.sku.message}</p>}
                  </div>
                  <div>
                    <label htmlFor={`variant-stock-${index}`} className="text-xs font-medium text-navy-600">
                      Stock
                    </label>
                    <input
                      id={`variant-stock-${index}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      aria-invalid={rowErrors?.stock ? true : undefined}
                      className={`${inputClasses} mt-1`}
                      {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                    />
                    {rowErrors?.stock && <p role="alert" className="mt-1 text-xs text-red-700">{rowErrors.stock.message}</p>}
                  </div>
                  <div className="flex items-end sm:pt-5">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove variant ${index + 1}`}
                      className="inline-flex h-10 items-center rounded-md border border-red-200 bg-white px-3 text-sm text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {listError && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {listError}
        </p>
      )}

      <Button type="button" variant="secondary" className="mt-3" onClick={() => append({ size: "", color: "", sku: "", stock: 0 })}>
        Add size and colour
      </Button>
    </div>
  );
}
