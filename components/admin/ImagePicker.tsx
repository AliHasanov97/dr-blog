"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui";
import {
  deleteMedia,
  listMedia,
  uploadMedia,
} from "@/app/admin/(panel)/_resources/media-actions";
import type { MediaScope } from "@/lib/admin/storage/scope";
import { cn } from "@/lib/utils";

export interface ImagePickerProps {
  /** Faylın hansı məzmuna aid olduğu — R2-də qovluğu təyin edir */
  scope?: MediaScope;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  hint?: string;
  /** Öz şəklini yükləmə düyməsi (default: açıq) */
  allowUpload?: boolean;
  /**
   * Yığcam rejim — yalnız seçilmiş şəkil göstərilir, qalereya düyməylə açılır.
   * Bir formada çox şəkil sahəsi olanda (slayd) istifadə olunur.
   */
  compact?: boolean;
  className?: string;
}

interface Uploaded {
  name: string;
  url: string;
  label: string;
  sizeLabel: string;
}

/**
 * Şəkil seçici — fayl yolu yazmaq əvəzinə şəkillərə baxıb seçmək.
 * Hazır şəkillərdən başqa, admin öz şəklini də yükləyə bilər (Cloudflare R2).
 */
export function ImagePicker({
  scope = { kind: "site" },
  label,
  value,
  options,
  onChange,
  hint,
  allowUpload = true,
  compact = false,
  className,
}: ImagePickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Uploaded[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(!compact);

  useEffect(() => {
    if (!allowUpload || !open) return;
    let active = true;
    listMedia("image", scope).then((res) => {
      if (active) setUploads(res.items);
    });
    return () => {
      active = false;
    };
  }, [allowUpload, open, scope]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      let lastUrl = "";
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.set("file", file);
        const result = await uploadMedia(data, "image", scope);
        if (!result.success || !result.item) {
          setError(result.message ?? "Şəkil yüklənmədi.");
          break;
        }
        setUploads((prev) => [result.item as Uploaded, ...prev]);
        lastUrl = result.item.url;
      }
      // Sonuncu yüklənən şəkil dərhal seçilir
      if (lastUrl) onChange(lastUrl);
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function handleDelete(item: Uploaded) {
    startTransition(async () => {
      const result = await deleteMedia(item.name);
      if (!result.success) {
        setError(result.message ?? "Şəkil silinmədi.");
        return;
      }
      setUploads((prev) => prev.filter((u) => u.name !== item.name));
      if (value === item.url) onChange(options[0]?.value ?? "");
    });
  }

  const selectedLabel =
    uploads.find((u) => u.url === value)?.label ??
    options.find((o) => o.value === value)?.label ??
    "";

  return (
    <div className={cn("flex flex-col gap-space-xs", className)}>
      <span className="font-label text-label-md text-on-surface-variant">
        {label}
      </span>
      {hint && (
        <span className="flex items-start gap-1 font-label text-label-sm text-outline">
          <Icon name="info" size={13} className="mt-0.5 shrink-0" />
          {hint}
        </span>
      )}

      {/* Yığcam rejimdə seçilmiş şəkil + «Dəyiş» düyməsi */}
      {compact && (
        <div className="flex items-center gap-space-sm">
          <span className="relative w-24 aspect-[16/10] rounded-md overflow-hidden border border-outline-variant bg-surface-container-low shrink-0">
            {value ? (
              <Image
                src={value}
                alt={selectedLabel}
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-outline">
                <Icon name="image" size={20} />
              </span>
            )}
          </span>
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="font-label text-label-md text-on-surface truncate">
              {selectedLabel || "Şəkil seçilməyib"}
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex w-fit items-center gap-1 font-label text-label-sm text-secondary hover:underline"
            >
              <Icon name={open ? "expand_less" : "photo_library"} size={15} />
              {open ? "Qalereyanı bağla" : "Şəkli dəyiş və ya yüklə"}
            </button>
          </span>
        </div>
      )}

      {open && (
        <>
          {allowUpload && (
            <div className="flex flex-wrap items-center gap-space-xs">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={pending}
                className="inline-flex items-center gap-1 h-9 px-space-sm rounded-md border border-secondary/40 bg-secondary/[0.08] font-label text-label-md text-on-secondary-container hover:bg-secondary/15 disabled:opacity-60 transition-colors"
              >
                <Icon name={pending ? "hourglass_top" : "upload"} size={16} />
                {pending ? "Yüklənir..." : "Kompüterdən şəkil yüklə"}
              </button>
              <span className="font-label text-label-sm text-outline">
                JPG, PNG, WEBP, GIF — ən çoxu 5 MB
              </span>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1 font-label text-label-sm text-error">
              <Icon name="error" size={14} />
              {error}
            </p>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-space-xs">
            {uploads.map((item) => (
              <Tile
                key={item.name}
                src={item.url}
                label={item.label}
                badge={item.sizeLabel}
                active={item.url === value}
                onSelect={() => onChange(item.url)}
                onDelete={() => handleDelete(item)}
              />
            ))}
            {options.map((opt) => (
              <Tile
                key={opt.value}
                src={opt.value}
                label={opt.label}
                active={opt.value === value}
                onSelect={() => onChange(opt.value)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Tile({
  src,
  label,
  badge,
  active,
  onSelect,
  onDelete,
}: {
  src: string;
  label: string;
  badge?: string;
  active: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        title={badge ? `${label} — ${badge}` : label}
        className={cn(
          "group relative w-full aspect-[16/10] rounded-lg overflow-hidden border-2 transition-colors",
          active
            ? "border-secondary"
            : "border-transparent hover:border-secondary/40",
        )}
      >
        <Image src={src} alt={label} fill sizes="160px" className="object-cover" />
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 px-1.5 py-1 font-label text-label-sm text-white text-start truncate",
            "bg-gradient-to-t from-primary-container/90 to-transparent",
          )}
        >
          {label}
        </span>
        {active && (
          <span className="absolute top-1 end-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
            <Icon name="check" size={13} />
          </span>
        )}
      </button>
      {onDelete && !active && (
        <button
          type="button"
          onClick={onDelete}
          title="Bu şəkli anbardan sil"
          className="absolute top-1 start-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 [div:hover>&]:opacity-100 transition-opacity"
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  );
}
