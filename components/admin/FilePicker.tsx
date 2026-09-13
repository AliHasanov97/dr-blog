"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui";
import {
  deleteMedia,
  listMedia,
  uploadMedia,
} from "@/app/(admin)/admin/(panel)/_resources/media-actions";
import type { MediaScope } from "@/lib/admin/storage/scope";
import { cn } from "@/lib/utils";

export interface PickedFile {
  url: string;
  title: string;
  extension: string;
  sizeLabel: string;
  /** Anbardakı açar — silmək üçün lazımdır */
  name?: string;
}

export interface FilePickerProps {
  /** Faylın hansı məzmuna aid olduğu — R2-də qovluğu təyin edir */
  scope?: MediaScope;
  /** Hazırda seçilmiş faylın ünvanı */
  value?: string;
  onSelect: (file: PickedFile) => void;
  className?: string;
}

const ACCEPT =
  "application/pdf,application/msword," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-excel," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const ICONS: Record<string, string> = {
  PDF: "picture_as_pdf",
  DOC: "description",
  DOCX: "description",
  XLS: "table",
  XLSX: "table",
};

/**
 * Endirilə bilən fayl seçici — kompüterdən yükləyir və əvvəl yüklənmişləri
 * siyahıda göstərir.
 */
export function FilePicker({
  scope = { kind: "site" },
  value,
  onSelect,
  className,
}: FilePickerProps) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    listMedia("file", scope).then((result) => {
      if (!active) return;
      setFiles(
        result.items.map((item) => ({
          url: item.url,
          title: item.label,
          extension: item.extension,
          sizeLabel: item.sizeLabel,
          name: item.name,
        })),
      );
    });
    return () => {
      active = false;
    };
  }, [scope]);

  /* Hazırda seçilmiş fayl ayrıca göstərilir — "Əvvəl yüklənənlər" siyahısında
   * öz seçiminizi təkrar görmək qarışıqlıq yaradır */
  const selected = files.find((f) => f.url === value);
  const otherFiles = files.filter((f) => f.url !== value);

  function upload(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadMedia(data, "file", scope);
      if (!result.success || !result.item) {
        setError(result.message ?? "Fayl yüklənmədi.");
        return;
      }
      const picked: PickedFile = {
        url: result.item.url,
        title: result.item.label,
        extension: result.item.extension,
        sizeLabel: result.item.sizeLabel,
        name: result.item.name,
      };
      setFiles((prev) => [picked, ...prev]);
      onSelect(picked);
      if (input.current) input.current.value = "";
    });
  }

  /**
   * Seçimi təmizləyir — R2-dəki faylı SİLMİR.
   *
   * Hazırda istifadədə olan sənədi bura basılan kimi anbardan silmək
   * təhlükəlidir: forma hələ saxlanmayıb, "Bağla" ilə ləğv etsəniz belə
   * fayl artıq yox olardı. Faylın özü ancaq qeyd silinəndə (protokol
   * silinəndə) və ya əvəz olunub saxlananda (`dbUpdateProtocol`)
   * avtomatik təmizlənir.
   */
  function clearSelection() {
    onSelect({ url: "", title: "", extension: "", sizeLabel: "" });
  }

  function remove(file: PickedFile) {
    /*
     * Anbardakı açar birbaşa götürülür. Əvvəllər ünvandan çıxarılırdı —
     * ünvanın forması dəyişəndə (məsələn R2-yə keçid) səhv açar alınırdı,
     * silmə isə səssizcə «uğurlu» sayılırdı.
     */
    const name = file.name ?? decodeURIComponent(file.url.split("/").pop() ?? "");
    if (!name) return;
    startTransition(async () => {
      const result = await deleteMedia(name);
      if (!result.success) {
        setError(result.message ?? "Fayl silinmədi.");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.url !== file.url));
    });
  }

  return (
    <div className={cn("flex flex-col gap-space-xs", className)}>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => upload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        className="inline-flex items-center gap-1 h-9 px-space-sm rounded-md border border-secondary/40 bg-secondary/[0.08] font-label text-label-md text-on-secondary-container hover:bg-secondary/15 disabled:opacity-60 transition-colors"
      >
        <Icon name={pending ? "hourglass_top" : "upload_file"} size={16} />
        {pending ? "Yüklənir..." : "Kompüterdən fayl yüklə"}
      </button>
      <span className="font-label text-label-sm text-outline">
        PDF, DOC, DOCX, XLS, XLSX — ən çoxu 20 MB
      </span>

      {error && (
        <p className="flex items-center gap-1 font-label text-label-sm text-error">
          <Icon name="error" size={14} />
          {error}
        </p>
      )}

      {selected && (
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-label-sm text-outline pt-space-2xs">
            Seçilmiş sənəd
          </span>
          <div className="flex items-center gap-1">
            <span className="flex-1 flex items-center gap-space-xs px-space-xs h-9 rounded-md min-w-0 bg-secondary/12 text-secondary">
              <Icon
                name={ICONS[selected.extension] ?? "attach_file"}
                size={17}
                className="shrink-0"
              />
              <span className="font-label text-label-md truncate flex-1">
                {selected.title}
              </span>
              <span className="font-label text-label-sm text-outline shrink-0">
                {selected.sizeLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={clearSelection}
              title="Seçimi ləğv et (fayl anbarda qalır)"
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        </div>
      )}

      {otherFiles.length > 0 && (
        <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto">
          <span className="font-label text-label-sm text-outline pt-space-2xs">
            Əvvəl yüklənənlər
          </span>
          {otherFiles.map((file) => (
            <div key={file.url} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(file)}
                className="flex-1 flex items-center gap-space-xs px-space-xs h-9 rounded-md text-start transition-colors min-w-0 text-on-surface hover:bg-surface-container"
              >
                <Icon
                  name={ICONS[file.extension] ?? "attach_file"}
                  size={17}
                  className="shrink-0 text-outline"
                />
                <span className="font-label text-label-md truncate flex-1">
                  {file.title}
                </span>
                <span className="font-label text-label-sm text-outline shrink-0">
                  {file.sizeLabel}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(file)}
                title="Faylı anbardan sil"
                className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-error hover:bg-error-container/60"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
