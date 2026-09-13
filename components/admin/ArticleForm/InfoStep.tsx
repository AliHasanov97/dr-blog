import { Button, FLAGS, Icon, TextAreaField, TextField } from "@/components/ui";
import { AdminCard } from "../AdminCard";
import { ChoiceGroup } from "../ChoiceGroup";
import { ImagePicker } from "../ImagePicker";
import type { MediaScope } from "@/lib/admin/storage/scope";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { COVER_MODES, type CoverMode } from "./types";

export interface InfoStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  /** Doldurulmayıb və növbəti addıma keçmək cəhd olunubsa — sahə qırmızı işarələnir */
  titleError?: string;
  excerpt: string;
  onExcerptChange: (value: string) => void;
  excerptError?: string;
  categorySlug: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  language: "az" | "ru";
  onLanguageChange: (value: "az" | "ru") => void;
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
  titleError,
  excerpt,
  onExcerptChange,
  excerptError,
  categorySlug,
  onCategoryChange,
  categories,
  language,
  onLanguageChange,
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
      {/*
        * Dil məqalənin ən önəmli parametridir — bir dəfə seçilir və bütün
        * saytda (siyahı, filtr, URL) həmin məqaləni müəyyənləşdirir, ona
        * görə ayrıca, gözə çarpan bir kart kimi ən başda göstərilir.
        */}
      <AdminCard title="Dil" description="Tərcümə eyni yazı deyil — hər dil üçün ayrı məqalə yaradılır">
        <div className="grid gap-space-sm sm:grid-cols-2">
          {(
            [
              {
                value: "az" as const,
                label: "Azərbaycan dili",
                description: "Sayt üçün əsas dil — indiyədək bütün yazılar bu dildədir.",
              },
              {
                value: "ru" as const,
                label: "Rus dili",
                description: "Rus dilli oxucular üçün — saytın /ru bölməsində görünür.",
              },
            ] as const
          ).map((opt) => {
            const active = language === opt.value;
            const Flag = FLAGS[opt.value];
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onLanguageChange(opt.value)}
                aria-pressed={active}
                className={cn(
                  "flex items-start gap-space-sm rounded-xl border-2 p-space-md text-start transition-colors",
                  active
                    ? "border-secondary bg-secondary/[0.08]"
                    : "border-outline-variant hover:border-secondary/40",
                )}
              >
                <Flag className="shrink-0 w-14 h-11 rounded-lg object-cover ring-1 ring-outline-variant/60" />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="flex items-center gap-space-2xs font-label text-label-lg text-on-surface">
                    {opt.label}
                    {active && (
                      <Icon name="check_circle" size={18} className="text-secondary" />
                    )}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant leading-snug">
                    {opt.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </AdminCard>

      <AdminCard title="Əsas məlumatlar">
        <div className="grid gap-space-md sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Başlıq"
              required
              placeholder="Ürək sağlamlığı və gündəlik stress"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              error={titleError}
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField
              label="Qısa təsvir"
              required
              rows={2}
              placeholder="Xroniki gərginliyin ürək damarlarına təsiri və müasir protokollar."
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              error={excerptError}
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
