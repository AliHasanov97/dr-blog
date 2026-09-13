import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ArticleFileProps {
  url: string;
  title: string;
  extension?: string;
  sizeLabel?: string;
  description?: React.ReactNode;
  className?: string;
  /**
   * PDF olduqda oxucuya nə təklif olunur.
   *  - `download` (default) — yalnız endirmə kartı
   *  - `read`     — yalnız səhifədə oxumaq, endirmə linki yoxdur
   *  - `both`     — endirmə kartı və altında səhifədə oxuma
   */
  access?: "download" | "read" | "both";
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
 * Məqaləyə əlavə edilmiş fayl.
 * Vizual dil «Protokollar» siyahısı ilə eynidir. PDF-lər `access`-dən asılı
 * olaraq endirmə kartı, səhifədə oxuma (`<iframe>`) və ya hər ikisi kimi
 * göstərilir.
 */
export function ArticleFile({
  url,
  title,
  extension = "PDF",
  sizeLabel,
  description,
  className,
  access = "download",
}: ArticleFileProps) {
  const t = useTranslations("article");
  const badge = badgeFor(extension);
  const isPdf = extension.toUpperCase() === "PDF";
  const canRead = isPdf && (access === "read" || access === "both");
  const canDownload = !canRead || access === "both";

  const header = (
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
  );

  const info = (
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
  );

  return (
    <div className={cn("clear-both", className)}>
      {canDownload ? (
        <a
          href={url}
          download
          className={cn(
            "flex items-center gap-space-md rounded-xl border border-surface-container bg-surface-container-lowest p-space-md",
            "hover:border-secondary/50 hover:bg-surface-container-low/60 transition-colors no-underline",
            canRead && "rounded-b-none",
          )}
        >
          {header}
          {info}
          <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
            <Icon name="download" size={16} />
            {t("download")}
          </span>
        </a>
      ) : (
        <div
          className={cn(
            "flex items-center gap-space-md rounded-xl rounded-b-none border border-surface-container bg-surface-container-lowest p-space-md",
          )}
        >
          {header}
          {info}
        </div>
      )}

      {canRead && (
        <iframe
          src={url}
          title={title}
          className="w-full h-[600px] rounded-b-xl border border-t-0 border-surface-container"
        />
      )}
    </div>
  );
}
