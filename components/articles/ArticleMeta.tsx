import { cn } from "@/lib/utils";

export interface ArticleMetaProps {
  categoryName?: string;
  dateLabel?: string;
  referenceLabel?: string;
  className?: string;
}

/** Kartların üstündəki metadata sətri: Kateqoriya • Tarix • İstinad */
export function ArticleMeta({
  categoryName,
  dateLabel,
  referenceLabel,
  className,
}: ArticleMetaProps) {
  const parts: React.ReactNode[] = [];

  if (categoryName)
    parts.push(
      <span key="cat" className="text-secondary font-semibold">
        {categoryName}
      </span>,
    );
  if (dateLabel) parts.push(<span key="date">{dateLabel}</span>);
  if (referenceLabel) parts.push(<span key="ref">{referenceLabel}</span>);

  return (
    <div
      className={cn(
        "flex items-center flex-wrap gap-x-space-xs gap-y-0.5 font-label text-label-sm text-outline",
        className,
      )}
    >
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-x-space-xs">
          {i > 0 && <span aria-hidden="true">•</span>}
          {part}
        </span>
      ))}
    </div>
  );
}
