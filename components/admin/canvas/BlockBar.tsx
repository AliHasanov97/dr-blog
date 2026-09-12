"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Blokun ayar zolağı — yalnız seçilmiş blokda görünür.
 * Yığcamdır: bir sıra kiçik ikon düymə. Mətn sahələri gizlidir və yalnız
 * «✎» düyməsinə basanda açılır ki, ekran forma sahələri ilə dolmasın.
 */
export function BlockBar({ children }: { children: ReactNode }) {
  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      className="clear-both mt-1 inline-flex items-center gap-0.5 rounded-full border border-surface-container bg-surface-container-lowest shadow-level-2 px-1 py-1"
    >
      {children}
    </div>
  );
}

export function BlockBarSep() {
  return (
    <span aria-hidden="true" className="w-px h-4 bg-outline-variant mx-0.5" />
  );
}

export function BlockBarButton({
  icon,
  text,
  title,
  active = false,
  tone = "normal",
  onClick,
}: {
  icon?: string;
  /** İkon əvəzinə çox qısa yazı (məsələn «S», «M», «L») */
  text?: string;
  title: string;
  active?: boolean;
  tone?: "normal" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded-full transition-colors font-label text-label-sm",
        active
          ? "bg-secondary text-on-secondary"
          : tone === "danger"
            ? "text-error hover:bg-error-container/60"
            : "text-on-surface-variant hover:bg-surface-container hover:text-secondary",
      )}
    >
      {icon ? <Icon name={icon} size={15} /> : text}
    </button>
  );
}

/**
 * «✎» ilə açılan gizli sahələr.
 *
 * Blokun altında ÜZƏN panel kimi açılır (`absolute`) — normal mətn axınına
 * qoşulmur, ona görə aşağıdakı məzmunu itələmir. (Valideyn `BlockBar`-ı
 * saxlayan qutu `relative` olmalıdır ki, panel düzgün nöqtədən açılsın.)
 *
 * `onClose` verilsə, sağ üst küncdə bağlama düyməsi çıxır və Escape ilə də
 * bağlanır — əvvəllər panelı bağlamağın yeganə yolu eyni işarəyə təkrar
 * basmaq və ya bloku seçimdən çıxarmaq (boş yerə klikləmək) idi, bu isə
 * dolu məqalədə çətin olurdu.
 */
export function BlockBarPanel({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!onClose) return;
    const close = onClose;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-20 top-full left-0 mt-1 max-h-[70vh] w-[min(90vw,24rem)] overflow-y-auto rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 p-space-sm flex flex-col gap-space-xs"
    >
      {onClose && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          title="Bağla"
          aria-label="Bağla"
          className="self-end -mt-0.5 -me-0.5 w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="close" size={14} />
        </button>
      )}
      {children}
    </div>
  );
}

export function BlockBarInput({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="font-label text-label-sm text-on-surface-variant">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-outline-variant bg-surface px-space-sm py-1.5 font-body text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-tertiary-fixed-dim/40"
      />
      {hint && (
        <span className="font-label text-label-sm text-outline">{hint}</span>
      )}
    </label>
  );
}
