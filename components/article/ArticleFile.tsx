import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ArticleFileProps {
  url: string;
  title: string;
  extension?: string;
  sizeLabel?: string;
  description?: React.ReactNode;
  className?: string;
}

/** Uzantıya görə ikon və rəng */
function badgeFor(extension: string) {
  const value = extension.toUpperCase();
  if (value === "PDF") {
    return { icon: "picture_as_pdf", tone: "bg-error-container/70 text-on-error-container" };
  }
  if (value === "DOC" || value === "DOCX") {
    return { icon: "description", tone: "bg-primary-fixed text-primary-container" };
  }
  if (value === "XLS" || value === "XLSX") {
    return { icon: "table", tone: "bg-secondary/15 text-secondary" };
  }
  return { icon: "attach_file", tone: "bg-surface-container text-on-surface-variant" };
}

/**
 * Məqaləyə əlavə edilmiş fayl — oxucu bir kliklə endirir.
 * Vizual dil «Protokollar» siyahısı ilə eynidir.
 */
export function ArticleFile({
  url,
  title,
  extension = "PDF",
  sizeLabel,
  description,
  className,
}: ArticleFileProps) {
  const badge = badgeFor(extension);

  return (
    <a
      href={url}
      download
      className={cn(
        "clear-both flex items-center gap-space-md rounded-xl border border-surface-container bg-surface-container-lowest p-space-md",
        "hover:border-secondary/50 hover:bg-surface-container-low/60 transition-colors no-underline",
        className,
      )}
    >
      <span
        className={cn(
          "w-11 h-11 shrink-0 rounded-lg flex flex-col items-center justify-center",
          badge.tone,
        )}
      >
        <Icon name={badge.icon} size={18} />
        <span className="font-label text-[9px] font-bold">
          {extension.toUpperCase()}
        </span>
      </span>

      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-label text-label-lg text-on-surface leading-snug">
          {title}
        </span>
        {(description || sizeLabel) && (
          <span className="font-body text-body-sm text-on-surface-variant truncate">
            {description}
            {description && sizeLabel ? " • " : ""}
            {sizeLabel}
          </span>
        )}
      </span>

      <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
        <Icon name="download" size={16} />
        Endir
      </span>
    </a>
  );
}
