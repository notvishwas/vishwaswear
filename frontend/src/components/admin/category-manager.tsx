"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory, deleteCategory, moveCategory, updateCategory, type CategoryInput } from "@/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory } from "@/lib/admin/categories";
import { slugify } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";
import { FormSection } from "./form-field";
import { useToast } from "./toast";

const EMPTY: CategoryInput = { name: "", slug: "", description: "", imageUrl: "" };

type CategoryFormProps = {
  initial: CategoryInput;
  submitLabel: string;
  onSubmit: (values: CategoryInput) => Promise<{ ok: boolean; fieldErrors?: Record<string, string> }>;
  onCancel?: () => void;
  idPrefix: string;
};

function CategoryForm({ initial, submitLabel, onSubmit, onCancel, idPrefix }: CategoryFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    const result = await onSubmit(values);
    setPending(false);
    if (result.ok) {
      setErrors({});
      if (!onCancel) {
        setValues(EMPTY);
        setSlugEdited(false);
      }
    } else {
      setErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-name`}
          label="Name"
          value={values.name}
          error={errors.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value, slug: slugEdited ? current.slug : slugify(event.target.value) }))
          }
        />
        <Input
          id={`${idPrefix}-slug`}
          label="Slug"
          value={values.slug}
          error={errors.slug}
          onChange={(event) => {
            setSlugEdited(true);
            setValues((current) => ({ ...current, slug: event.target.value }));
          }}
        />
      </div>
      <Textarea
        id={`${idPrefix}-description`}
        label="Description (optional)"
        rows={2}
        value={values.description}
        error={errors.description}
        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
      />
      <Input
        id={`${idPrefix}-image`}
        label="Image address (optional)"
        placeholder="https://"
        value={values.imageUrl}
        error={errors.imageUrl}
        onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
      />
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function run(action: Promise<{ ok: boolean; message: string; fieldErrors?: Record<string, string> }>) {
    const result = await action;
    if (result.ok) {
      toast.success(result.message);
      refresh();
    } else {
      toast.error(result.message);
    }
    return result;
  }

  return (
    <div className="flex flex-col gap-8">
      <FormSection title="Add a category">
        <CategoryForm idPrefix="new" initial={EMPTY} submitLabel="Add category" onSubmit={(values) => run(createCategory(values))} />
      </FormSection>

      {categories.length === 0 ? (
        <p className="rounded-md border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-navy-500">
          No categories yet. Add your first one above.
        </p>
      ) : (
        <ul className="divide-y divide-cream-300 rounded-md border border-cream-300 bg-white" aria-label="Categories">
          {categories.map((category, index) => (
            <li key={category.id} className="p-4">
              {editingId === category.id ? (
                <CategoryForm
                  idPrefix={`edit-${category.id}`}
                  initial={{
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? "",
                    imageUrl: category.image_url ?? "",
                  }}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (values) => {
                    const result = await run(updateCategory(category.id, values));
                    if (result.ok) setEditingId(null);
                    return result;
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-800">{category.name}</p>
                    <p className="text-xs text-navy-400">
                      /{category.slug} · {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Move ${category.name} up`}
                      disabled={index === 0}
                      onClick={() => void run(moveCategory(category.id, "up"))}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-navy-200 text-navy-800 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${category.name} down`}
                      disabled={index === categories.length - 1}
                      onClick={() => void run(moveCategory(category.id, "down"))}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-navy-200 text-navy-800 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(category.id)}
                      className="inline-flex h-9 items-center rounded-md border border-navy-800 px-3 text-sm font-semibold text-navy-800 hover:bg-navy-800 hover:text-white"
                    >
                      Edit
                    </button>
                    <ConfirmDialog
                      trigger="Delete"
                      title={`Delete ${category.name}?`}
                      description={
                        category.productCount > 0
                          ? `This category still has ${category.productCount} ${category.productCount === 1 ? "product" : "products"}, so it can't be deleted. Move or delete them first.`
                          : "This removes the category for good."
                      }
                      confirmLabel="Delete"
                      destructive
                      onConfirm={async () => {
                        await run(deleteCategory(category.id));
                      }}
                      triggerClassName="inline-flex h-9 items-center rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
