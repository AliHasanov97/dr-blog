"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, Icon } from "@/components/ui";
import type { ProtocolDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProtocolListProps {
  documents: ProtocolDocument[];
  className?: string;
}

/** Həkimlər üçün yüklənə bilən/oxuna bilən PDF protokolları */
export function ProtocolList({ documents, className }: ProtocolListProps) {
  const t = useTranslations("articles");
  const [active, setActive] = useState<ProtocolDocument | null>(null);

  return (
    <>
      <Card padded={false} className={cn("divide-y divide-surface-container", className)}>
        {documents.map((doc) => {
          const canRead = doc.access === "read" || doc.access === "both";
          const canDownload = !canRead || doc.access === "both";

          const header = (
            <span className="w-11 h-11 shrink-0 rounded-lg bg-error-container/70 flex flex-col items-center justify-center text-on-error-container">
              <Icon name="picture_as_pdf" size={18} />
              <span className="font-label text-[9px] font-bold">PDF</span>
            </span>
          );
          const info = (
            <span className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-label text-label-lg text-on-surface leading-snug">
                {doc.title}
              </span>
              <span className="font-body text-body-sm text-on-surface-variant truncate">
                {doc.description} • {doc.fileSizeLabel}
              </span>
            </span>
          );

          if (canRead && !canDownload) {
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActive(doc)}
                className="flex w-full items-center gap-space-md p-space-md text-start hover:bg-surface-container-low/60 transition-colors"
              >
                {header}
                {info}
                <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
                  <Icon name="visibility" size={16} />
                  {t("protocolView")}
                </span>
              </button>
            );
          }

          return (
            <div key={doc.id} className="flex items-center gap-space-md p-space-md">
              {header}
              {info}
              <span className="shrink-0 flex items-center gap-space-sm">
                {canRead && (
                  <button
                    type="button"
                    onClick={() => setActive(doc)}
                    className="inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary hover:underline"
                  >
                    <Icon name="visibility" size={16} />
                    {t("protocolView")}
                  </button>
                )}
                {canDownload && (
                  <a
                    href={doc.fileUrl}
                    download
                    className="inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary hover:underline"
                  >
                    <Icon name="download" size={16} />
                    {t("protocolDownload")}
                  </a>
                )}
              </span>
            </div>
          );
        })}
      </Card>

      <ProtocolViewer document={active} onClose={() => setActive(null)} />
    </>
  );
}

/** Seçilmiş sənədi tam ekran modalda göstərir */
function ProtocolViewer({
  document: doc,
  onClose,
}: {
  document: ProtocolDocument | null;
  onClose: () => void;
}) {
  const t = useTranslations("articles");
  useEffect(() => {
    if (!doc) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [doc, onClose]);

  if (!doc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
      className="fixed inset-0 z-[60] flex items-center justify-center p-margin-mobile sm:p-space-lg"
    >
      <button
        type="button"
        aria-label={t("protocolClose")}
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/45 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
      />

      <div className="relative flex w-full max-w-4xl h-[85vh] flex-col rounded-xl bg-surface-container-lowest border border-surface-container shadow-level-2 overflow-hidden">
        <div className="flex items-center gap-space-sm px-space-md h-14 shrink-0 border-b border-surface-container">
          <span className="w-8 h-8 shrink-0 rounded-lg bg-error-container/70 flex items-center justify-center text-on-error-container">
            <Icon name="picture_as_pdf" size={16} />
          </span>
          <span className="font-label text-label-lg text-on-surface truncate flex-1">
            {doc.title}
          </span>
          {doc.access === "both" && (
            <a
              href={doc.fileUrl}
              download
              className="hidden sm:inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary hover:underline"
            >
              <Icon name="download" size={16} />
              {t("protocolDownload")}
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("protocolClose")}
            className="text-outline hover:text-on-surface"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <iframe src={doc.fileUrl} title={doc.title} className="flex-1 w-full" />
      </div>
    </div>
  );
}
