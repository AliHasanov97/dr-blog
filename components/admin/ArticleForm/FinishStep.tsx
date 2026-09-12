import { Button, Icon, TextAreaField } from "@/components/ui";
import { AdminCard } from "../AdminCard";
import { ToggleRow } from "./ToggleRow";
import type { ArticleReference } from "@/lib/types";

export interface FinishStepProps {
  references: ArticleReference[];
  onReferencesChange: (references: ArticleReference[]) => void;
  warnings: string[];
  allowComments: boolean;
  onAllowCommentsChange: (value: boolean) => void;
  showTableOfContents: boolean;
  onShowTableOfContentsChange: (value: boolean) => void;
  isFeatured: boolean;
  onIsFeaturedChange: (value: boolean) => void;
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  pending: boolean;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onSavePublish: () => void;
}

export function FinishStep({
  references,
  onReferencesChange,
  warnings,
  allowComments,
  onAllowCommentsChange,
  showTableOfContents,
  onShowTableOfContentsChange,
  isFeatured,
  onIsFeaturedChange,
  metaDescription,
  onMetaDescriptionChange,
  pending,
  onBack,
  onPreview,
  onSaveDraft,
  onSavePublish,
}: FinishStepProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <AdminCard title="İstinadlar">
        <div className="flex flex-col gap-space-xs">
          {references.map((ref, index) => (
            <div key={ref.id} className="flex items-center gap-space-sm">
              <span className="font-label text-label-sm text-outline w-5 shrink-0">
                {index + 1}.
              </span>
              <input
                type="text"
                placeholder="Mənbə adı, jurnal, il..."
                value={ref.source}
                onChange={(e) =>
                  onReferencesChange(
                    references.map((r, i) =>
                      i === index ? { ...r, source: e.target.value } : r,
                    ),
                  )
                }
                className="flex-1 min-w-0 px-space-sm py-1.5 rounded-md border border-surface-container bg-surface text-body-sm outline-none focus:border-secondary"
              />
              <button
                type="button"
                onClick={() =>
                  onReferencesChange(references.filter((_, i) => i !== index))
                }
                title="Sil"
                className="text-outline hover:text-error shrink-0"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onReferencesChange([
                ...references,
                { id: `ref-${Date.now()}`, source: "", description: "" },
              ])
            }
            className="inline-flex w-fit items-center gap-1 font-label text-label-sm text-secondary hover:underline mt-space-xs"
          >
            <Icon name="add" size={14} />
            Əlavə et
          </button>
        </div>
      </AdminCard>

      {/*
       * Xəbərdarlıqlar əvvəllər yalnız «Önizlə» pəncərəsində
       * görünürdü — ora girməyən redaktor onları heç görmürdü.
       */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-tertiary-fixed-dim/50 bg-tertiary-fixed-dim/10 p-space-md flex flex-col gap-space-2xs">
          <span className="flex items-center gap-space-2xs font-label text-label-lg text-on-tertiary-container">
            <Icon name="lightbulb" size={18} />
            Nəzərə alın
          </span>
          <ul className="flex flex-col gap-1">
            {warnings.map((w) => (
              <li
                key={w}
                className="flex items-start gap-1 font-body text-body-sm text-on-tertiary-container leading-snug"
              >
                <Icon name="radio_button_unchecked" size={13} className="mt-1 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tənzimləmələr */}
      <AdminCard title="Tənzimləmələr">
        <div className="flex flex-col gap-space-lg">
          {/* Məzmun tənzimləmələri */}
          <div className="grid gap-space-sm sm:grid-cols-2">
            <ToggleRow
              icon="comment"
              label="Şərhlərə icazə"
              hint="Sönülü olsa bu məqalədə şərh bölməsi göstərilmir"
              checked={allowComments}
              onChange={onAllowCommentsChange}
            />
            <ToggleRow
              icon="list"
              label="Mündəricat göstər"
              hint="Məqalə başlıqlarını yan paneldə sıralayır"
              checked={showTableOfContents}
              onChange={onShowTableOfContentsChange}
            />
            <ToggleRow
              icon="star"
              label="Önə çıxar"
              hint="Ana səhifədə vurğulanır"
              checked={isFeatured}
              onChange={onIsFeaturedChange}
            />
          </div>

          {/* SEO */}
          <TextAreaField
            label="Meta təsvir (SEO)"
            rows={2}
            placeholder="Axtarış nəticələrində görünən qısa mətn (155 simvol tövsiyə olunur)"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
          />
        </div>
      </AdminCard>

      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <Icon name="arrow_back" size={18} />
          Geri
        </Button>
        <div className="flex gap-space-sm">
          <Button variant="tonal" onClick={onPreview}>
            <Icon name="visibility" size={18} />
            Önizlə
          </Button>
          <Button variant="tonal" disabled={pending} onClick={onSaveDraft}>
            Qaralama
          </Button>
          <Button disabled={pending} onClick={onSavePublish}>
            {pending ? "Gözləyin..." : "Dərc et"}
          </Button>
        </div>
      </div>
    </div>
  );
}
