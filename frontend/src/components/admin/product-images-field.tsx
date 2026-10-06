"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useFieldArray, type Control, type UseFormGetValues, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import type { ProductFormInput } from "@/lib/admin/product-schema";
import { useToast } from "./toast";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGES = 12;

type ProductImagesFieldProps = {
  control: Control<ProductFormInput>;
  register: UseFormRegister<ProductFormInput>;
  getValues: UseFormGetValues<ProductFormInput>;
  error?: string;
};

/** Multi-upload to Supabase Storage, drag (or use the arrows) to reorder, edit alt text, delete. */
export function ProductImagesField({ control, register, getValues, error }: ProductImagesFieldProps) {
  const toast = useToast();
  const { fields, append, remove, move } = useFieldArray({ control, name: "images", keyName: "fieldKey" });
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = createBrowserSupabaseClient();
    const room = MAX_IMAGES - fields.length;
    const selected = [...files].slice(0, Math.max(room, 0));
    if (files.length > selected.length) toast.error(`Only ${MAX_IMAGES} images are allowed per product.`);

    setUploading(true);
    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: use a JPG, PNG, WebP or AVIF image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 5 MB. Please use a smaller image.`);
        continue;
      }

      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `products/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

      if (uploadError) {
        toast.error(`${file.name} couldn't be uploaded: ${uploadError.message}`);
        continue;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      append({ url: data.publicUrl, alt: getValues("name") ?? "" });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeImage(index: number) {
    const image = fields[index];
    remove(index);
    // An image that was never saved has nothing else pointing at it, so its file can go now.
    if (!image.id && image.url.includes(`/${BUCKET}/`)) {
      const path = decodeURIComponent(image.url.split(`/${BUCKET}/`)[1]?.split("?")[0] ?? "");
      if (path) await createBrowserSupabaseClient().storage.from(BUCKET).remove([path]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id="image-upload"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={(event) => void upload(event.target.files)}
        />
        <Button type="button" variant="secondary" loading={uploading} disabled={fields.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()}>
          {uploading ? "Uploading…" : "Upload images"}
        </Button>
        <p className="text-xs text-navy-400">JPG, PNG, WebP or AVIF, up to 5 MB each. Portrait (4:5) photos look best. The first image is the main one.</p>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {fields.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-navy-200 p-6 text-center text-sm text-navy-500">
          No images yet. Products without a photo look unfinished in the shop.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3" aria-label="Product images">
          {fields.map((field, index) => (
            <li
              key={field.fieldKey}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "flex cursor-grab items-center gap-3 rounded-md border border-cream-300 bg-cream-100 p-2 sm:p-3",
                dragIndex === index && "opacity-50",
              )}
            >
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm bg-cream-200 sm:w-20">
                <Image src={field.url} alt="" fill sizes="80px" className="object-cover" draggable={false} />
                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-navy-800 py-0.5 text-center text-[0.625rem] font-semibold uppercase tracking-wider text-white">
                    Main
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <label htmlFor={`image-alt-${index}`} className="text-xs font-medium text-navy-600">
                  Alt text (describes the photo)
                </label>
                <input
                  id={`image-alt-${index}`}
                  type="text"
                  className="mt-1 h-10 w-full rounded-md border border-navy-200 bg-white px-3 text-sm focus-visible:border-gold-500"
                  {...register(`images.${index}.alt`)}
                />
              </div>

              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} earlier`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-navy-200 bg-white text-navy-800 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move image ${index + 1} later`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-navy-200 bg-white text-navy-800 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => void removeImage(index)}
                  aria-label={`Delete image ${index + 1}`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
