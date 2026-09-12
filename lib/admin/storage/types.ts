import "server-only";

/**
 * Fayl anbarının ortaq interfeysi.
 *
 * Yalnız Cloudflare R2 reallaşdırması var — diskə yazma qəsdən yoxdur.
 * Faylın hansı qovluğa düşdüyü `scope.ts`-dəki əhatə ilə təyin olunur.
 */

export type MediaKind = "image" | "file";

export interface StoredFile {
  /** Anbardakı açar — silmə əməliyyatı üçün */
  name: string;
  /** Saytda işlədilən tam ünvan */
  url: string;
  size: number;
  /** Sıralama üçün (ən yenilər əvvəldə) */
  modified: number;
}

export interface StorageDriver {
  /** Anbarın adı — loqlarda və admin panelində göstərilir */
  readonly label: string;
  /** `prefix` verilsə yalnız o qovluq oxunur */
  list(kind: MediaKind, prefix?: string): Promise<StoredFile[]>;
  put(name: string, body: Buffer, contentType: string): Promise<string>;
  remove(name: string): Promise<boolean>;
  /** Qovluqdakı bütün faylları (tipindən asılı olmayaraq) silir — silinən say qaytarılır */
  removePrefix(prefix: string): Promise<number>;
}

/** Şəkillər — SVG qəsdən yoxdur (skript daşıya bilər) */
export const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
/** Oxucunun endirə biləcəyi sənədlər */
export const FILE_EXT = /\.(pdf|doc|docx|xls|xlsx)$/i;

export function matchesKind(name: string, kind: MediaKind): boolean {
  return (kind === "image" ? IMAGE_EXT : FILE_EXT).test(name);
}
