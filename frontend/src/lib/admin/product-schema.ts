import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MONEY_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

/** Rupees typed as text ("12999" or "12999.50") to paise. */
export function rupeesToPaise(value: string): number {
  return Math.round(Number(value) * 100);
}

export function paiseToRupees(paise: number): string {
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

const optionalText = (max: number) => z.string().trim().max(max, { error: `Keep this under ${max} characters` });

const variantSchema = z.object({
  id: z.uuid().optional(),
  size: z.string().trim().min(1, { error: "Enter a size" }).max(12, { error: "Max 12 characters" }),
  color: z.string().trim().min(1, { error: "Enter a colour" }).max(30, { error: "Max 30 characters" }),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9-]{1,39}$/, { error: "Use letters, numbers and dashes (2-40 characters)" }),
  stock: z.number({ error: "Enter a number" }).int({ error: "Whole numbers only" }).min(0, { error: "Cannot be negative" }).max(100_000),
});

const imageSchema = z.object({
  id: z.uuid().optional(),
  url: z
    .string()
    .trim()
    .min(1)
    .max(1000)
    .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), { error: "Invalid image address" }),
  alt: optionalText(200),
});

/** Shared by the product form (in the browser) and the save action (on the server). */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Enter a product name" }).max(160, { error: "Keep this under 160 characters" }),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { error: "Enter a slug" })
      .max(120)
      .regex(SLUG_PATTERN, { error: "Use lowercase letters, numbers and single dashes" }),
    description: optionalText(4000),
    categoryId: z.uuid({ error: "Choose a category" }),
    price: z.string().trim().regex(MONEY_PATTERN, { error: "Enter a price like 12999 or 12999.50" }),
    compareAtPrice: z.string().trim().refine((value) => value === "" || MONEY_PATTERN.test(value), {
      error: "Enter a price like 15999, or leave empty",
    }),
    fabric: optionalText(200),
    fit: optionalText(100),
    careInstructions: optionalText(1000),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    variants: z.array(variantSchema).min(1, { error: "Add at least one size and colour" }).max(100),
    images: z.array(imageSchema).max(12, { error: "Up to 12 images" }),
  })
  .superRefine((value, ctx) => {
    const price = Number(value.price);
    if (value.compareAtPrice !== "" && Number(value.compareAtPrice) <= price) {
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Must be higher than the price" });
    }

    const seenSkus = new Set<string>();
    const seenCombos = new Set<string>();
    value.variants.forEach((variant, index) => {
      const sku = variant.sku.toUpperCase();
      if (seenSkus.has(sku)) ctx.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "Duplicate SKU" });
      seenSkus.add(sku);

      const combo = `${variant.size.toLowerCase()}|${variant.color.toLowerCase()}`;
      if (seenCombos.has(combo)) {
        ctx.addIssue({ code: "custom", path: ["variants", index, "size"], message: "This size and colour is already listed" });
      }
      seenCombos.add(combo);
    });
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
