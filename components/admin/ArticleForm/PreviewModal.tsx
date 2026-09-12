import { Icon } from "@/components/ui";
import { ArticlePreview } from "../ArticlePreview";
import type { ArticleBlock } from "@/lib/types";

export function PreviewModal({
  open,
  onClose,
  warnings,
  title,
  excerpt,
  categoryName,
  coverImageUrl,
  showCoverImage,
  dateLabel,
  blocks,
  isPeerReviewed,
}: {
  open: boolean;
  onClose: () => void;
  warnings: string[];
  title: string;
  excerpt: string;
  categoryName: string;
  coverImageUrl: string;
  showCoverImage: boolean;
  dateLabel: string;
  blocks: ArticleBlock[];
  isPeerReviewed: boolean;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-space-md bg-on-surface/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl my-space-lg bg-surface rounded-2xl shadow-level-3 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-surface-container">
          <span className="flex items-center gap-space-xs">
            <Icon name="visibility" size={18} className="text-secondary" />
            <span className="font-label text-label-lg text-on-surface">Preview</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 h-9 px-space-sm rounded-md font-label text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Icon name="close" size={16} />
            Close
          </button>
        </div>

        {warnings.length > 0 && (
          <div className="mx-space-lg mt-space-md rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed/30 p-space-sm">
            <ul className="flex flex-col gap-0.5">
              {warnings.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-1 font-body text-body-sm text-on-tertiary-fixed-variant"
                >
                  <Icon name="radio_button_unchecked" size={13} className="mt-1" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-space-lg">
          <ArticlePreview
            variant="full"
            title={title}
            excerpt={excerpt}
            categoryName={categoryName}
            coverImageUrl={coverImageUrl}
            showCoverImage={showCoverImage}
            dateLabel={dateLabel}
            authorName="Dr. Narmin Aliyeva"
            blocks={blocks}
            isPeerReviewed={isPeerReviewed}
          />
        </div>
      </div>
    </div>
  );
}
