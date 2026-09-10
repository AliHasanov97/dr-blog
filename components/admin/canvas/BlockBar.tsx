"use client";

import type { ReactNode } from "react";
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

/** «✎» ilə açılan gizli sahələr */
export function BlockBarPanel({ children }: { children: ReactNode }) {
  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      className="clear-both mt-1 rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-1 p-space-sm flex flex-col gap-space-xs max-w-md"
    >
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
        className="w-full rounded-md border border-outline-variant bg-surface px-space-sm py-1.5 font-body text-body-sm text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-tertiary-fixed-dim/40"
      />
      {hint && (
        <span className="font-label text-label-sm text-outline">{hint}</span>
      )}
    </label>
  );
}
