import "server-only";
import { randomBytes } from "node:crypto";
import { slugify } from "@/lib/utils";
import { articleKeyOfPath, prefixOf, storage, usesPeriod } from "./storage";
import type { MediaKind, MediaScope } from "./storage";

/**
 * Media anbarı.
 *
 * Fayllar yalnız Cloudflare R2-də saxlanılır. Bu fayl yoxlama, adlandırma
 * və göstəriləcək formanı bilir; yazma işini `lib/admin/storage` görür.
 */

export type { MediaKind, MediaScope, ArticlePart } from "./storage";
export { scopeLabel } from "./storage";
export { storageStatus } from "./storage";

/** Şəkillər — SVG qəsdən yoxdur (skript daşıya bilər) */
const ALLOWED_IMAGES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

/** Oxucunun endirə biləcəyi sənədlər */
const ALLOWED_FILES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // şəkillər üçün 5 MB
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // sənədlər üçün 20 MB

const NOT_CONFIGURED =
  "Fayl anbarı qoşulmayıb. .env faylında R2 açarlarını təyin edin.";

export interface MediaItem {
  /** Anbardakı tam açar (qovluq daxil) — silmə əməliyyatı üçün */
  name: string;
  /** Saytda istifadə olunan ünvan */
  url: string;
  /** Siyahıda göstərilən ad */
  label: string;
  sizeLabel: string;
  kind: MediaKind;
  /** Uzantı — «PDF», «DOCX» kimi göstərilir */
  extension: string;
  /** Hansı məqaləyə aid olduğu (məqalə faylı deyilsə boş) */
  articleKey: string | null;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Açardan göstəriləcək etiket düzəldir — qovluq və təsadüfi sonluq atılır */
function toLabel(key: string): string {
  const file = key.split("/").pop() ?? key;
  const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/-[a-z0-9]{6}$/i, "");
  return base.replace(/-/g, " ").trim() || file;
}

/**
 * Yüklənmiş faylların siyahısı — ən yenilər əvvəldə.
 * `folder` verilsə yalnız həmin bölmənin faylları qaytarılır.
 */
export async function listUploads(
  kind: MediaKind = "image",
  scope?: MediaScope,
): Promise<MediaItem[]> {
  const driver = storage();
  /* Anbar qoşulmayıbsa siyahı sadəcə boşdur — səhifə açılmağa davam edir */
  if (!driver) return [];

  const files = await driver.list(kind, scope && prefixOf(scope));
  return files
    .sort((a, b) => b.modified - a.modified)
    .map((file) => ({
      name: file.name,
      url: file.url,
      label: toLabel(file.name),
      sizeLabel: humanSize(file.size),
      kind,
      extension: (file.name.split(".").pop() ?? "").toUpperCase(),
      articleKey: articleKeyOfPath(file.name),
    }));
}

export interface UploadResult {
  success: boolean;
  item?: MediaItem;
  message?: string;
}

/**
 * Bir faylı yoxlayıb anbara yazır.
 *
 * Məqalə faylları `meqaleler/<məqalə açarı>/<hissə>/` qovluğuna düşür —
 * hər şəklin hansı məqaləyə aid olduğu qovluğun özündən görünür.
 * Ümumi fayllar isə aylara bölünür (`videolar/2026-09/...`).
 */
export async function saveUpload(
  file: File,
  kind: MediaKind = "image",
  scope: MediaScope = { kind: "site" },
): Promise<UploadResult> {
  const driver = storage();
  if (!driver) {
    return { success: false, message: NOT_CONFIGURED };
  }

  const allowed = kind === "image" ? ALLOWED_IMAGES : ALLOWED_FILES;
  const limit = kind === "image" ? MAX_UPLOAD_BYTES : MAX_FILE_BYTES;
  const extension = allowed[file.type];

  if (!extension) {
    return {
      success: false,
      message:
        kind === "image"
          ? "Yalnız JPG, PNG, WEBP, GIF və AVIF şəkilləri yükləmək olar (SVG qəbul edilmir)."
          : "Yalnız PDF, DOC, DOCX, XLS və XLSX faylları yükləmək olar.",
    };
  }
  if (file.size === 0) {
    return { success: false, message: "Fayl boşdur." };
  }
  if (file.size > limit) {
    return {
      success: false,
      message: `Fayl ${humanSize(limit)}-dan böyük ola bilməz (bu fayl ${humanSize(file.size)}).`,
    };
  }

  const base =
    slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 48) || "fayl";
  const now = new Date();
  const period = usesPeriod(scope)
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}/`
    : "";
  const key = `${prefixOf(scope)}/${period}${base}-${randomBytes(3).toString("hex")}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await driver.put(key, buffer, file.type);
    return {
      success: true,
      item: {
        name: key,
        url,
        label: toLabel(key),
        sizeLabel: humanSize(file.size),
        kind,
        extension: extension.replace(".", "").toUpperCase(),
        articleKey: scope.kind === "article" ? scope.articleKey : null,
      },
    };
  } catch (error) {
    console.error("[media] Yükləmə xətası:", error);
    return {
      success: false,
      message: "Fayl anbara yazıla bilmədi. Bir azdan yenidən cəhd edin.",
    };
  }
}

/** Yüklənmiş faylı silir */
export async function deleteUpload(name: string): Promise<boolean> {
  const driver = storage();
  if (!driver || !name.trim()) return false;
  return driver.remove(name);
}
