"use client";

import { useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { checkOrphanedMedia, confirmDeleteOrphans } from "./actions";
import type { OrphanFile } from "@/lib/admin/media-sweep";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function humanDate(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("az", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(ms),
  );
}

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

/** Fayl adından qovluq/təsadüfi sonluq atılmış qısa göstəriş adı */
function shortLabel(name: string): string {
  const file = name.split("/").pop() ?? name;
  return file.length > 40 ? `${file.slice(0, 18)}…${file.slice(-16)}` : file;
}

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "empty"; message: string }
  | { kind: "found"; orphans: OrphanFile[] }
  | { kind: "deleting" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

/**
 * R2-də heç bir bazada qeydə bağlı olmayan faylları tapıb silir.
 *
 * Heç vaxt kor-koranə silmir: "Yoxla" düyməsi yalnız NAMİZƏD siyahısını
 * göstərir, silmə isə ancaq admin siyahını gözdən keçirib "Seçilənləri
 * sil"ə basandan sonra baş verir. Hər fayl ayrıca seçilə/seçimdən çıxarıla
 * bilər — şübhəli görünən bir şey varsa sadəcə seçimdən çıxarmaq kifayətdir.
 */
export function MediaSweepButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function check() {
    setStatus({ kind: "checking" });
    startTransition(async () => {
      const res = await checkOrphanedMedia();
      if (!res.success) {
        setStatus({ kind: "error", message: res.message ?? "Xəta baş verdi." });
        return;
      }
      const orphans = res.orphans ?? [];
      if (orphans.length === 0) {
        setStatus({ kind: "empty", message: res.message ?? "" });
        return;
      }
      setSelected(new Set(orphans.map((o) => o.name)));
      setStatus({ kind: "found", orphans });
    });
  }

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function confirmDelete() {
    if (status.kind !== "found") return;
    const items = status.orphans
      .filter((o) => selected.has(o.name))
      .map((o) => ({ name: o.name, url: o.url }));
    if (items.length === 0) return;

    setStatus({ kind: "deleting" });
    startTransition(async () => {
      const res = await confirmDeleteOrphans(items);
      setStatus(
        res.success
          ? { kind: "done", message: res.message ?? "" }
          : { kind: "error", message: res.message ?? "Xəta baş verdi." },
      );
    });
  }

  return (
    <div className="mt-space-lg rounded-xl border border-surface-container bg-surface-container-lowest p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-2xs font-label text-label-lg text-on-surface">
        <Icon name="mop" size={18} className="text-secondary" />
        Yetim faylları təmizlə
      </div>
      <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
        Məqalə, protokol, video və ya profil redaktəsi zamanı əvəz olunan/silinən
        fayllar adətən dərhal silinir. Bu düymə isə R2-də qalıb heç bir yerdə
        işlədilməyən faylları (məs. məqalə mətnindən silinmiş tək bir şəkli)
        tapır — <strong>heç nəyi dərhal silmir</strong>, əvvəlcə siyahını
        (tarixi ilə birlikdə) göstərir, siz seçib təsdiqləyəndən sonra silinir.
      </p>

      {status.kind === "found" && (
        <div className="rounded-lg border border-tertiary-fixed-dim/40 bg-tertiary-fixed-dim/10 p-space-sm flex flex-col gap-space-xs">
          <p className="font-label text-label-sm text-on-tertiary-fixed-variant">
            {status.orphans.length} fayl heç bir yerdə istifadə olunmur. Silinməsini
            istəmədiyiniz varsa işarəni götürün.
          </p>
          <div className="max-h-[28rem] overflow-y-auto flex flex-col gap-1.5 rounded-md bg-surface-container-lowest p-1.5">
            {status.orphans.map((o) => {
              const isImage = IMAGE_EXT.test(o.name);
              return (
                <label
                  key={o.name}
                  className={cn(
                    "flex items-center gap-space-sm rounded-md px-space-xs py-space-xs cursor-pointer hover:bg-surface-container-low",
                    !selected.has(o.name) && "opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(o.name)}
                    onChange={() => toggle(o.name)}
                    className="shrink-0"
                  />

                  {isImage ? (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                      title="Tam ölçüdə bax"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- R2-dən gələn uzaq şəkil, Next domen icazəsi lazım deyil */}
                      <img
                        src={o.url}
                        alt={shortLabel(o.name)}
                        loading="lazy"
                        className="w-16 h-16 object-cover rounded-lg border border-surface-container bg-surface-container hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <span className="w-16 h-16 shrink-0 rounded-lg border border-surface-container bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <Icon name="draft" size={26} />
                    </span>
                  )}

                  <span className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <span className="font-label text-label-md text-on-surface truncate">
                      {o.context}
                    </span>
                    <span
                      className="font-body text-body-sm text-on-surface-variant truncate"
                      title={o.name}
                    >
                      {shortLabel(o.name)}
                    </span>
                    <span className="font-label text-label-sm text-outline">
                      {humanSize(o.size)} • {humanDate(o.modified)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex items-center gap-space-sm mt-space-2xs">
            <Button
              size="sm"
              icon="delete"
              disabled={pending || selected.size === 0}
              className="bg-error border-error/40 hover:bg-error/90"
              onClick={confirmDelete}
            >
              {pending ? "Silinir..." : `Seçilənləri sil (${selected.size})`}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => setStatus({ kind: "idle" })}
            >
              Ləğv et
            </Button>
          </div>
        </div>
      )}

      {status.kind !== "found" && (
        <div className="flex items-center gap-space-sm">
          <Button
            variant="secondary"
            size="sm"
            icon="search"
            disabled={pending}
            onClick={check}
          >
            {status.kind === "checking" ? "Yoxlanılır..." : "Yoxla"}
          </Button>
          {(status.kind === "empty" || status.kind === "done" || status.kind === "error") && (
            <span className="font-label text-label-sm text-on-surface-variant">
              {status.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
