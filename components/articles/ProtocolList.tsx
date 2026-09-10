import { Card, Icon } from "@/components/ui";
import type { ProtocolDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ProtocolListProps {
  documents: ProtocolDocument[];
  className?: string;
}

/** Həkimlər üçün yüklənə bilən PDF protokolları */
export function ProtocolList({ documents, className }: ProtocolListProps) {
  return (
    <Card padded={false} className={cn("divide-y divide-surface-container", className)}>
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.fileUrl}
          download
          className="flex items-center gap-space-md p-space-md hover:bg-surface-container-low/60 transition-colors"
        >
          <span className="w-11 h-11 shrink-0 rounded-lg bg-error-container/70 flex flex-col items-center justify-center text-on-error-container">
            <Icon name="picture_as_pdf" size={18} />
            <span className="font-label text-[9px] font-bold">PDF</span>
          </span>
          <span className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="font-label text-label-lg text-on-surface leading-snug">
              {doc.title}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant truncate">
              {doc.description} • {doc.fileSizeLabel}
            </span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
            <Icon name="download" size={16} />
            Endir
          </span>
        </a>
      ))}
    </Card>
  );
}
