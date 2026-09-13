"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { READING_SIZES as SIZES, useReadingSize } from "@/lib/reader-store";
import { cn } from "@/lib/utils";

export interface ReaderControlsProps {
  className?: string;
}

/**
 * Şrift ölçüsü (A- / A+) və yaddaş düymələri.
 * Ölçü `<html data-reading-size>` atributu ilə CSS-ə ötürülür.
 */
export function ReaderControls({ className }: ReaderControlsProps) {
  const t = useTranslations("article");
  /* Ölçü brauzerdə qalır — oxucu hər məqalədə tərcihini yenidən
   * seçməsin deyə. */
  const { size, setSize } = useReadingSize();

  const sizeIndex = SIZES.indexOf(size);

  useEffect(() => {
    document.documentElement.dataset.readingSize = size;
    return () => {
      delete document.documentElement.dataset.readingSize;
    };
  }, [size]);

  return (
    <div className={cn("flex items-center gap-space-2xs", className)}>
      <div className="flex items-center rounded-md border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <button
          type="button"
          onClick={() => setSize(SIZES[Math.max(0, sizeIndex - 1)])}
          disabled={sizeIndex === 0}
          aria-label={t("decreaseFontSize")}
          className="w-9 h-9 flex items-center justify-center font-label text-label-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
        >
          A-
        </button>
        <span className="w-px h-5 bg-outline-variant" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setSize(SIZES[Math.min(SIZES.length - 1, sizeIndex + 1)])}
          disabled={sizeIndex === SIZES.length - 1}
          aria-label={t("increaseFontSize")}
          className="w-9 h-9 flex items-center justify-center font-label text-label-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
        >
          A+
        </button>
      </div>

    </div>
  );
}
