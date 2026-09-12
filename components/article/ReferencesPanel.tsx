import { CollapsiblePanel } from "@/components/ui";
import type { ArticleReference } from "@/lib/types";

export interface ReferencesPanelProps {
  references: ArticleReference[];
  title?: string;
}

export function ReferencesPanel({
  references,
  title = "İstifadə olunmuş elmi ədəbiyyat",
}: ReferencesPanelProps) {
  /* Elmi ədəbiyyat istifadə olunmayan məqalədə boş panel göstərməyə dəyməz */
  if (references.length === 0) return null;

  return (
    <CollapsiblePanel title={title} icon="science">
      <ol className="flex flex-col gap-space-sm">
        {references.map((ref, index) => (
          <li
            key={ref.id}
            /* Mətndəki [ref=N] teqi bura tullanır */
            id={`istinad-${index + 1}`}
            className="flex gap-space-xs scroll-mt-28 target:bg-secondary/[0.08] rounded-md"
          >
            <span className="font-label text-label-lg text-secondary shrink-0">
              {index + 1}.
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="font-label text-label-lg text-on-surface">
                {ref.source}
              </span>
              <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                {ref.description}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </CollapsiblePanel>
  );
}
