import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const PRODUCT_IMAGE_BUCKET = "product-images";

const PUBLIC_PATH_MARKER = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

/** Storage path of an image in our bucket, or null for local or external images. */
function storagePathFromUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_PATH_MARKER);
  return index === -1 ? null : decodeURIComponent(url.slice(index + PUBLIC_PATH_MARKER.length).split("?")[0]);
}

/** Deletes uploaded files for the given image URLs. Failures are logged, never thrown. */
export async function removeProductImageFiles(urls: string[]): Promise<void> {
  const paths = urls.map(storagePathFromUrl).filter((path): path is string => path !== null);
  if (paths.length === 0) return;

  const { error } = await createAdminSupabaseClient().storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);
  if (error) console.error("[admin] Failed to remove product image files", error.message);
}
