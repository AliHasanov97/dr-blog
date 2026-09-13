"use server";

import { getSession } from "@/lib/auth/session";
import {
  deleteUpload,
  listUploads,
  saveUpload,
  type MediaItem,
  type MediaKind,
  type MediaScope,
} from "@/lib/admin/media";

/**
 * Şəkil yükləmə əməliyyatları.
 * Hər birində sessiya yoxlanılır — bu action-lar `/admin` route-larından kənarda
 * da çağırıla bildiyi üçün middleware qorumasına arxalanmaq olmaz.
 */

export interface MediaListResult {
  items: MediaItem[];
}

export async function listMedia(
  kind: MediaKind = "image",
  scope?: MediaScope,
): Promise<MediaListResult> {
  const session = await getSession();
  if (!session) return { items: [] };
  return { items: await listUploads(kind, scope) };
}

export interface MediaUploadResult {
  success: boolean;
  item?: MediaItem;
  message?: string;
}

export async function uploadMedia(
  formData: FormData,
  kind: MediaKind = "image",
  scope: MediaScope = { kind: "site" },
): Promise<MediaUploadResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Sessiya bitib — yenidən daxil olun." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, message: "Fayl seçilməyib." };
  }
  return saveUpload(file, kind, scope);
}

export async function deleteMedia(
  name: string,
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Sessiya bitib — yenidən daxil olun." };
  }
  const removed = await deleteUpload(name);
  return removed
    ? { success: true }
    : { success: false, message: "Şəkil silinmədi." };
}
