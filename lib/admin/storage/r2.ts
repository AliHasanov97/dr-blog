import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { matchesKind, type MediaKind, type StorageDriver, type StoredFile } from "./types";

/**
 * Cloudflare R2 anbarı.
 *
 * R2 S3 API-si ilə uyğundur, ona görə AWS SDK işlədilir — sonradan başqa
 * S3 uyğun provayderə keçmək lazım gəlsə yalnız `endpoint` dəyişir.
 *
 * Fayllar `public/` qovluğunda deyil, kənar anbarda saxlanılır: deploy
 * zamanı itmir, bir neçə server nüsxəsi eyni faylları görür və oxucuya
 * Cloudflare şəbəkəsindən verilir.
 */

const accountId = process.env.R2_ACCOUNT_ID?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
const bucket = process.env.R2_BUCKET?.trim();
/** Faylların oxunduğu publik ünvan — özəl domen və ya r2.dev linki */
const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, "");

/**
 * R2 işləyə bilirmi.
 *
 * `R2_PUBLIC_URL` şərt deyil: publik ünvan olmayanda fayllar `/media/...`
 * marşrutu ilə serverin özündən verilir. Ünvan təyin ediləndə isə birbaşa
 * Cloudflare şəbəkəsindən — bu, daha sürətlidir.
 */
export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

/** Fayllar birbaşa Cloudflare-dən verilirmi (publik ünvan varmı) */
export function hasPublicUrl(): boolean {
  return Boolean(publicUrl);
}

/** Konfiqurasiyanın hansı hissəsi əskikdir — admin panelində göstərmək üçün */
export function missingR2Settings(): string[] {
  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucket) missing.push("R2_BUCKET");
  return missing;
}

/** Faylın oxunacağı ünvan */
function fileUrl(key: string): string {
  return publicUrl
    ? `${publicUrl}/${encodeURIComponent(key)}`
    : `/media/${encodeURIComponent(key)}`;
}

let client: S3Client | null = null;

function s3(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId as string,
      secretAccessKey: secretAccessKey as string,
    },
  });
  return client;
}

export const r2Driver: StorageDriver = {
  label: "Cloudflare R2",

  async list(kind: MediaKind, prefix?: string): Promise<StoredFile[]> {
    const files: StoredFile[] = [];
    let token: string | undefined;

    /* R2 bir sorğuda ən çox 1000 obyekt qaytarır — qalanı `token` ilə */
    do {
      const result = await s3().send(
        new ListObjectsV2Command({
          Bucket: bucket,
          /* Qovluq verilibsə sorğu elə serverdə daraldılır */
          Prefix: prefix ? `${prefix}/` : undefined,
          ContinuationToken: token,
          MaxKeys: 1000,
        }),
      );

      for (const object of result.Contents ?? []) {
        const name = object.Key;
        if (!name || !matchesKind(name, kind)) continue;
        files.push({
          name,
          url: fileUrl(name),
          size: object.Size ?? 0,
          modified: object.LastModified?.getTime() ?? 0,
        });
      }

      token = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (token);

    return files;
  },

  async put(name, body, contentType) {
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: name,
        Body: body,
        ContentType: contentType,
        /* Fayl adları təsadüfi sonluqla unikaldır — uzun keş təhlükəsizdir */
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return fileUrl(name);
  },

  async remove(name) {
    /*
     * S3 və R2 silməni idempotent sayır: olmayan açar üçün də uğur
     * qaytarır. Ona görə əvvəlcə faylın varlığı yoxlanılır — əks halda
     * səhv açar göndəriləndə interfeys «silindi» deyir, fayl isə qalır.
     */
    try {
      await s3().send(new HeadObjectCommand({ Bucket: bucket, Key: name }));
    } catch {
      console.warn("[r2] Silinəcək fayl tapılmadı:", name);
      return false;
    }

    try {
      await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: name }));
      return true;
    } catch (error) {
      console.error("[r2] Silmə xətası:", error);
      return false;
    }
  },
};

/** Publik ünvanın host hissəsi — `next.config.ts` üçün lazımdır */
export function r2PublicHost(): string | null {
  if (!publicUrl) return null;
  try {
    return new URL(publicUrl).hostname;
  } catch {
    return null;
  }
}

export interface ObjectStream {
  body: ReadableStream;
  contentType: string;
  size?: number;
}

/**
 * Faylı R2-dən oxuyur — `/media/...` marşrutu üçün.
 * Fayl yoxdursa `null` qaytarır, çünki bu adi 404 haldır.
 */
export async function getObjectStream(
  key: string,
): Promise<ObjectStream | null> {
  try {
    const result = await s3().send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    if (!result.Body) return null;

    return {
      body: result.Body.transformToWebStream(),
      contentType: result.ContentType ?? "application/octet-stream",
      size: result.ContentLength,
    };
  } catch {
    return null;
  }
}
