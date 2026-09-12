import { Button, Icon, TextAreaField, TextField } from "@/components/ui";
import { AdminCard } from "../AdminCard";
import { ChoiceGroup } from "../ChoiceGroup";
import { ImagePicker } from "../ImagePicker";
import type { MediaScope } from "@/lib/admin/storage/scope";
import type { Category } from "@/lib/types";
import { COVER_MODES, type CoverMode } from "./types";

export interface InfoStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  excerpt: string;
  onExcerptChange: (value: string) => void;
  categorySlug: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  coverMode: CoverMode;
  onCoverModeChange: (value: CoverMode) => void;
  coverImageUrl: string;
  onCoverImageChange: (value: string) => void;
  coverOptions: readonly { value: string; label: string }[];
  coverScope: MediaScope;
  onNext: () => void;
}

export function InfoStep({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  categorySlug,
  onCategoryChange,
  categories,
  coverMode,
  onCoverModeChange,
  coverImageUrl,
  onCoverImageChange,
  coverOptions,
  coverScope,
  onNext,
}: InfoStepProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <AdminCard title="Əsas məlumatlar">
        <div className="grid gap-space-md sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Başlıq"
              required
              placeholder="Ürək sağlamlığı və gündəlik stress"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField
              label="Qısa təsvir"
              rows={2}
              placeholder="Xroniki gərginliyin ürək damarlarına təsiri və müasir protokollar."
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
            />
          </div>
          <ChoiceGroup
            label="Mövzu"
            value={categorySlug}
            onChange={onCategoryChange}
            options={categories.map((c) => ({
              value: c.slug,
              label: c.name,
              icon: c.icon,
            }))}
          />
          <div className="flex flex-col gap-space-sm">
            <ChoiceGroup
              label="Örtük şəkli"
              hint="Əvvəlcə şəklin harada görünəcəyini seçin"
              variant="cards"
              value={coverMode}
              onChange={(v) => onCoverModeChange(v as CoverMode)}
              options={COVER_MODES}
            />
            {coverMode === "none" ? (
              <p className="flex items-start gap-space-xs rounded-lg border border-dashed border-outline-variant p-space-sm font-body text-body-sm text-outline leading-snug">
                <Icon name="text_fields" size={18} className="mt-0.5 shrink-0" />
                Məqalə birbaşa başlıq və mətnlə açılacaq; siyahıda isə
                mətn əsaslı kart görünəcək.
              </p>
            ) : (
              <ImagePicker
                scope={coverScope}
                label="Şəkli seçin"
                value={coverImageUrl}
                options={coverOptions}
                onChange={onCoverImageChange}
              />
            )}
          </div>
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Davam et
          <Icon name="arrow_forward" size={18} />
        </Button>
      </div>
    </div>
  );
}
