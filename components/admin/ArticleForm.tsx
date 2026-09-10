"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Button,
  Icon,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { AdminCard } from "./AdminCard";
import { ArticlePreview } from "./ArticlePreview";
import { ArticleCanvas } from "./canvas/ArticleCanvas";
import { ChoiceGroup } from "./ChoiceGroup";
import { HelpNote } from "./HelpNote";
import { ImagePicker } from "./ImagePicker";
import type { ActionResult } from "@/lib/admin/types";
import { collectWarnings, estimateReadMinutes } from "@/lib/admin/article-helpers";
import { toDateLabel } from "@/lib/admin/format";
import {
  autosaveArticle,
  type ArticlePayload,
} from "@/app/admin/(panel)/meqaleler/actions";
import type { AdminArticle, ArticleStatus } from "@/lib/mock/store";
import type { ArticleBlock, ArticleReference, Category } from "@/lib/types";
import type { MediaScope } from "@/lib/admin/storage/scope";
import { cn } from "@/lib/utils";

/** Örtük şəklinin görünmə rejimi */
type CoverMode = "none" | "card" | "full";

const COVER_MODES = [
  {
    value: "full",
    label: "Kartda və məqalədə",
    icon: "wallpaper",
    description: "Siyahıda kart şəkli, məqalənin başında böyük örtük",
  },
  {
    value: "card",
    label: "Yalnız kartda",
    icon: "gallery_thumbnail",
    description: "Siyahıda görünür, məqalə birbaşa mətnlə başlayır",
  },
  {
    value: "none",
    label: "Şəkilsiz",
    icon: "hide_image",
    description: "Mövzu şəkillə izah olunmayanda — heç yerdə çıxmır",
  },
] as const;

/** Yeni məqalə üçün GUID — serverdəki `generateGuid` ilə eyni formatdadır */
function newGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ArticleFormProps {
  article?: AdminArticle;
  categories: Category[];
  coverOptions: readonly { value: string; label: string }[];
  onSubmit: (payload: ArticlePayload) => Promise<ActionResult>;
}

export function ArticleForm({
  article,
  categories,
  coverOptions,
  onSubmit,
}: ArticleFormProps) {
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);

  const steps = [
    { key: "info", label: "Məlumatlar", icon: "edit_note" },
    { key: "content", label: "Mətn", icon: "article" },
    { key: "finish", label: "Bitir", icon: "check_circle" },
  ];

  /** Addım validasiyası */
  function validateStep(targetStep: number): string[] {
    const errors: string[] = [];

    // Step 0 validasiyası
    if (targetStep > 0) {
      if (!title.trim()) errors.push("Başlıq daxil edin");
      if (!excerpt.trim()) errors.push("Qısa təsvir daxil edin");
    }

    // Step 1 validasiyası
    if (targetStep > 1) {
      const hasContent = blocks.some((b) => {
        if (b.type === "paragraph" || b.type === "lead" || b.type === "heading") {
          return b.text.trim().length > 0;
        }
        return true;
      });
      if (blocks.length === 0 || !hasContent) {
        errors.push("Məqalə mətni daxil edin");
      }
    }

    return errors;
  }

  function goToStep(targetStep: number) {
    // Geri getməyə həmişə icazə var
    if (targetStep < step) {
      setStepErrors([]);
      setStep(targetStep);
      return;
    }

    // İrəli getmək üçün validasiya
    const errors = validateStep(targetStep);
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors([]);
    setStep(targetStep);
  }

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [categorySlug, setCategorySlug] = useState(
    article?.category.slug ?? categories[0]?.slug ?? "",
  );
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [manualMinutes, setManualMinutes] = useState<string>(
    article ? String(article.readMinutes) : "",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    article?.coverImageUrl ?? coverOptions[0]?.value ?? "",
  );
  /* Örtük şəklinin harada göründüyü. Mövcud məqalədə vəziyyət bazadakı
   * iki sahədən oxunur: `coverImageUrl` — kart şəkli, `heroImageUrl` —
   * məqalənin başındakı böyük örtük. */
  const [coverMode, setCoverMode] = useState<CoverMode>(() => {
    if (!article) return "full";
    if (!article.coverImageUrl) return "none";
    return article.heroImageUrl ? "full" : "card";
  });

  /* Formadakı seçim rejimdən asılı deyil — «Yoxdur»a keçib geri qayıdanda
   * əvvəl seçilmiş şəkil itmir, ona görə göndərilən dəyər ayrıca hesablanır. */
  const effectiveCover = coverMode === "none" ? "" : coverImageUrl;
  const showHeroImage = coverMode === "full";
  const [tags, setTags] = useState((article?.tags ?? []).join(", "));
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [isPeerReviewed, setIsPeerReviewed] = useState(
    article?.isPeerReviewed ?? false,
  );
  const [allowComments, setAllowComments] = useState(article?.allowComments ?? true);
  const [showTableOfContents, setShowTableOfContents] = useState(article?.showTableOfContents ?? true);
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? "");
  const [doctorNote, setDoctorNote] = useState(article?.doctorNote ?? "");
  const [journalLabel, setJournalLabel] = useState(article?.journalLabel ?? "");
  const [blocks, setBlocks] = useState<ArticleBlock[]>(article?.blocks ?? []);
  const [references, setReferences] = useState<ArticleReference[]>(
    article?.references ?? [],
  );

  /*
   * Məqalənin fayl qovluğunu təyin edən açar.
   *
   * Mövcud məqalədə slug hazırdır. Yeni məqalədə isə slug serverdə yaranırdı
   * — halbuki şəkillər ondan ƏVVƏL yüklənir. Ona görə GUID burada yaradılır
   * və həm qovluq adı, həm də saxlanılan slug kimi işlədilir: fayllar
   * məqalənin öz qovluğuna düşür və yadda saxlayandan sonra da orada qalır.
   */
  const [articleKey] = useState(() => article?.slug ?? newGuid());

  const coverScope = useMemo<MediaScope>(
    () => ({ kind: "article", articleKey, part: "cover" }),
    [articleKey],
  );

  const autoMinutes = useMemo(() => estimateReadMinutes(blocks), [blocks]);
  const readMinutes = manualMinutes ? Number(manualMinutes) || autoMinutes : autoMinutes;
  const warnings = useMemo(
    () => collectWarnings({ title, excerpt, blocks }),
    [title, excerpt, blocks],
  );
  const categoryName =
    categories.find((c) => c.slug === categorySlug)?.name ?? "";

  // Modal açıq olanda Escape ilə bağlansın
  useEffect(() => {
    if (!previewOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [previewOpen]);

  /* --------------------------------------------------------------
   * Avtomatik saxlama — iş heç vaxt itmir
   * ------------------------------------------------------------ */

  const payload = useMemo<ArticlePayload>(
    () => ({
      title: title.trim(),
      /* Şəkillər bu açarla yüklənib — slug da eyni olmalıdır */
      slug: article?.slug ?? articleKey,
      excerpt: excerpt.trim(),
      categorySlug,
      status: article?.status ?? "draft",
      publishedAt,
      readMinutes,
      coverImageUrl: effectiveCover,
      showHeroImage,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isPeerReviewed,
      allowComments,
      showTableOfContents,
      metaDescription: metaDescription.trim(),
      doctorNote: doctorNote.trim(),
      journalLabel: journalLabel.trim(),
      blocks,
      references,
    }),
    [
      title,
      excerpt,
      categorySlug,
      article?.slug,
      articleKey,
      article?.status,
      publishedAt,
      readMinutes,
      effectiveCover,
      showHeroImage,
      tags,
      isFeatured,
      isPeerReviewed,
      allowComments,
      showTableOfContents,
      metaDescription,
      doctorNote,
      journalLabel,
      blocks,
      references,
    ],
  );

  const snapshot = useMemo(() => JSON.stringify(payload), [payload]);
  const lastSaved = useRef(snapshot);
  const [autoState, setAutoState] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAtLabel, setSavedAtLabel] = useState("");
  const draftKey = article ? `dr-article-${article.id}` : "dr-article-new";

  useEffect(() => {
    if (snapshot === lastSaved.current) return;
    if (!title.trim()) return;

    const timer = setTimeout(async () => {
      setAutoState("saving");
      if (article) {
        const result = await autosaveArticle(article.id, payload);
        if (!result.success) {
          setAutoState("idle");
          return;
        }
      } else {
        // Yeni məqalə hələ anbarda yoxdur — brauzerdə ehtiyat nüsxə saxlanılır
        try {
          window.localStorage.setItem(draftKey, snapshot);
        } catch {
          /* yaddaş bağlıdırsa sadəcə ötürülür */
        }
      }
      lastSaved.current = snapshot;
      setSavedAtLabel(
        new Date().toLocaleTimeString("az-AZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setAutoState("saved");
    }, 10000);

    return () => clearTimeout(timer);
  }, [snapshot, payload, title, article, draftKey]);

  /* Yeni məqalə üçün brauzerdə qalmış qaralama */
  const [recovered, setRecovered] = useState<ArticlePayload | null>(null);
  useEffect(() => {
    if (article) return;
    // Hidrasiyadan sonra oxunur ki, server render-i ilə fərq yaranmasın
    const timer = setTimeout(() => {
      try {
        const raw = window.localStorage.getItem("dr-article-new");
        if (!raw) return;
        const parsed = JSON.parse(raw) as ArticlePayload;
        if (parsed?.title) setRecovered(parsed);
      } catch {
        /* zədəli qeyd nəzərə alınmır */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [article]);

  function restoreDraft() {
    if (!recovered) return;
    setTitle(recovered.title);
    setExcerpt(recovered.excerpt);
    setCategorySlug(recovered.categorySlug);
    setCoverImageUrl(recovered.coverImageUrl);
    setCoverMode(
      !recovered.coverImageUrl
        ? "none"
        : (recovered.showHeroImage ?? true)
          ? "full"
          : "card",
    );
    setTags(recovered.tags.join(", "));
    setIsFeatured(recovered.isFeatured);
    setIsPeerReviewed(recovered.isPeerReviewed);
    setAllowComments(recovered.allowComments ?? true);
    setShowTableOfContents(recovered.showTableOfContents ?? true);
    setMetaDescription(recovered.metaDescription ?? "");
    setDoctorNote(recovered.doctorNote);
    setJournalLabel(recovered.journalLabel);
    setBlocks(recovered.blocks);
    setReferences(recovered.references);
    setRecovered(null);
  }

  function discardDraft() {
    try {
      window.localStorage.removeItem("dr-article-new");
    } catch {
      /* nəzərə alınmır */
    }
    setRecovered(null);
  }

  function save(status: ArticleStatus) {
    if (!title.trim()) {
      setFeedback({ tone: "error", text: "Əvvəlcə başlıq yazın." });
      return;
    }
    startTransition(async () => {
      const result = await onSubmit({ ...payload, status });
      lastSaved.current = JSON.stringify({ ...payload, status });
      if (!article) discardDraft();
      setFeedback(
        result.success
          ? {
              tone: "ok",
              text:
                status === "published"
                  ? "Dərc olundu — məqalə artıq saytda görünür."
                  : "Qaralama yadda saxlanıldı. Saytda hələ görünmür.",
            }
          : { tone: "error", text: result.message ?? "Əməliyyat alınmadı." },
      );
    });
  }

  return (
    <>
      <div className="flex flex-col gap-space-md">
        <div className="sticky top-16 z-20 -mx-space-md lg:-mx-space-lg px-space-md lg:px-space-lg py-space-sm bg-surface/95 backdrop-blur-xl border-b border-surface-container">
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <Link
              href="/admin/meqaleler"
              className="inline-flex items-center gap-1 font-label text-label-lg text-on-surface-variant hover:text-secondary shrink-0"
            >
              <Icon name="arrow_back" size={17} />
              Məqalələr
            </Link>
            {article && (
              <span className="hidden lg:inline font-label text-label-sm text-outline truncate">
                / {article.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            {autoState !== "idle" && (
              <span
                role="status"
                className="hidden md:inline-flex items-center gap-1 font-label text-label-sm text-outline"
              >
                <Icon
                  name={autoState === "saving" ? "cloud_sync" : "cloud_done"}
                  size={15}
                />
                {autoState === "saving"
                  ? "Saxlanılır..."
                  : `Saxlanıldı ${savedAtLabel}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1 h-11 px-space-sm rounded-md font-label text-label-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Icon name="visibility" size={17} />
              Önəbaxış
            </button>
            <Button
              variant="secondary"
              icon="save"
              disabled={pending}
              onClick={() => save("draft")}
            >
              Qaralama saxla
            </Button>
            <Button
              icon="public"
              disabled={pending}
              onClick={() => save("published")}
            >
              {pending ? "Gözləyin..." : "Dərc et"}
            </Button>
          </div>
        </div>

        {feedback && (
          <p
            role="status"
            className={cn(
              "mt-space-sm flex items-center gap-1 rounded-md px-space-sm py-space-xs font-label text-label-md",
              feedback.tone === "ok"
                ? "bg-secondary/12 text-on-secondary-container"
                : "bg-error-container/60 text-on-error-container",
            )}
          >
            <Icon
              name={feedback.tone === "ok" ? "check_circle" : "error"}
              size={15}
            />
            {feedback.text}
          </p>
        )}
        </div>
      </div>

      {recovered && (
        <div className="rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed/40 p-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm">
          <span className="flex items-start gap-space-xs font-body text-body-sm text-on-tertiary-fixed-variant flex-1">
            <Icon name="history" size={18} className="mt-0.5 shrink-0" />
            Yarımçıq qalmış qaralamanız var: «{recovered.title}». Bərpa edim?
          </span>
          <span className="flex items-center gap-space-xs shrink-0">
            <Button variant="secondary" icon="restore" onClick={restoreDraft}>
              Bərpa et
            </Button>
            <button
              type="button"
              onClick={discardDraft}
              className="h-11 px-space-sm rounded-md font-label text-label-md text-on-surface-variant hover:bg-surface-container-low"
            >
              Sil
            </button>
          </span>
        </div>
      )}

      {/* Step-by-step layout */}
      <div className="flex flex-col lg:flex-row gap-space-lg">
        {/* Sol panel - Stepper */}
        <div className="lg:w-56 shrink-0">
          <nav className="lg:sticky lg:top-36">
            {/* Mobil: üfüqi */}
            <div className="flex lg:hidden items-center justify-center gap-space-lg mb-space-md">
              {steps.map((s, i) => {
                const isComplete = i < step;
                const isCurrent = i === step;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => goToStep(i)}
                    className="flex flex-col items-center gap-space-xs active:scale-95 transition-transform"
                  >
                    <span
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-label text-title-md transition-colors",
                        isCurrent
                          ? "bg-secondary text-on-secondary"
                          : isComplete
                            ? "bg-secondary/20 text-secondary"
                            : "bg-surface-container text-outline",
                      )}
                    >
                      {isComplete ? <Icon name="check" size={22} /> : i + 1}
                    </span>
                    <span className={cn(
                      "font-label text-label-md",
                      isCurrent ? "text-secondary" : "text-outline"
                    )}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: şaquli */}
            <div className="hidden lg:block">
              {steps.map((s, i) => {
                const isComplete = i < step;
                const isCurrent = i === step;
                const isLast = i === steps.length - 1;

                return (
                  <div key={s.key} className="relative">
                    {/* Birləşdirici xətt */}
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-5 top-12 w-0.5 h-8",
                          i < step ? "bg-secondary/40" : "bg-outline-variant/30",
                        )}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => goToStep(i)}
                      className="relative w-full flex items-center gap-space-md py-space-sm text-start group"
                    >
                      {/* Dairə */}
                      <span
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                          isCurrent
                            ? "bg-secondary text-on-secondary"
                            : isComplete
                              ? "bg-secondary/20 text-secondary"
                              : "bg-surface-container text-outline group-hover:bg-surface-container-high",
                        )}
                      >
                        {isComplete ? (
                          <Icon name="check" size={20} />
                        ) : (
                          <span className="font-label text-title-md">{i + 1}</span>
                        )}
                      </span>

                      {/* Mətn */}
                      <span
                        className={cn(
                          "font-label text-title-sm transition-colors",
                          isCurrent
                            ? "text-secondary"
                            : isComplete
                              ? "text-on-surface"
                              : "text-outline group-hover:text-on-surface-variant",
                        )}
                      >
                        {s.label}
                      </span>
                    </button>
                  </div>
                );
              })}

              {/* Xəta mesajı */}
              {stepErrors.length > 0 && (
                <p className="mt-space-sm text-body-md text-error flex items-center gap-1">
                  <Icon name="error" size={16} />
                  {stepErrors[0]}
                </p>
              )}
            </div>
          </nav>
        </div>

        {/* Sağ panel - Məzmun */}
        <div className="flex-1 min-w-0">
          {/* Step 1: Əsas məlumatlar */}
          {step === 0 && (
            <div className="flex flex-col gap-space-md">
              <AdminCard title="Əsas məlumatlar">
                <div className="grid gap-space-md sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <TextField
                      label="Başlıq"
                      required
                      placeholder="Ürək sağlamlığı və gündəlik stress"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <TextAreaField
                      label="Qısa təsvir"
                      rows={2}
                      placeholder="Xroniki gərginliyin ürək damarlarına təsiri və müasir protokollar."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>
                  <ChoiceGroup
                    label="Mövzu"
                    value={categorySlug}
                    onChange={setCategorySlug}
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
                      onChange={(v) => setCoverMode(v as CoverMode)}
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
                        onChange={setCoverImageUrl}
                      />
                    )}
                  </div>
                </div>
              </AdminCard>

              <div className="flex justify-end">
                <Button onClick={() => goToStep(1)}>
                  Davam et
                  <Icon name="arrow_forward" size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Məqalənin mətni */}
          {step === 1 && (
            <div className="flex flex-col gap-space-md">
              <AdminCard
                title="Məqalənin mətni"
                className="!overflow-visible"
              >
                <ArticleCanvas
                  blocks={blocks}
                  onChange={setBlocks}
                  articleKey={articleKey}
                />
              </AdminCard>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => goToStep(0)}>
                  <Icon name="arrow_back" size={18} />
                  Geri
                </Button>
                <Button onClick={() => goToStep(2)}>
                  Davam et
                  <Icon name="arrow_forward" size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: İstinadlar və tənzimləmələr */}
          {step === 2 && (
            <div className="flex flex-col gap-space-md">
              <AdminCard title="İstinadlar">
                <div className="flex flex-col gap-space-xs">
                  {references.map((ref, index) => (
                    <div
                      key={ref.id}
                      className="flex items-center gap-space-sm"
                    >
                      <span className="font-label text-label-sm text-outline w-5 shrink-0">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder="Mənbə adı, jurnal, il..."
                        value={ref.source}
                        onChange={(e) =>
                          setReferences(
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
                          setReferences(references.filter((_, i) => i !== index))
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
                      setReferences([
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
                        className="flex items-start gap-1 font-body text-body-sm text-on-tertiary-fixed-variant leading-snug"
                      >
                        <Icon
                          name="radio_button_unchecked"
                          size={13}
                          className="mt-1 shrink-0"
                        />
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
                      onChange={setAllowComments}
                    />
                    <ToggleRow
                      icon="list"
                      label="Mündəricat göstər"
                      hint="Məqalə başlıqlarını yan paneldə sıralayır"
                      checked={showTableOfContents}
                      onChange={setShowTableOfContents}
                    />
                    <ToggleRow
                      icon="star"
                      label="Önə çıxar"
                      hint="Ana səhifədə vurğulanır"
                      checked={isFeatured}
                      onChange={setIsFeatured}
                    />
                  </div>

                  {/* SEO */}
                  <TextAreaField
                    label="Meta təsvir (SEO)"
                    rows={2}
                    placeholder="Axtarış nəticələrində görünən qısa mətn (155 simvol tövsiyə olunur)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </AdminCard>

              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => goToStep(1)}>
                  <Icon name="arrow_back" size={18} />
                  Geri
                </Button>
                <div className="flex gap-space-sm">
                  <Button variant="tonal" onClick={() => setPreviewOpen(true)}>
                    <Icon name="visibility" size={18} />
                    Önizlə
                  </Button>
                  <Button
                    variant="tonal"
                    disabled={pending}
                    onClick={() => save("draft")}
                  >
                    Qaralama
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => save("published")}
                  >
                    {pending ? "Gözləyin..." : "Dərc et"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        warnings={warnings}
        title={title}
        excerpt={excerpt}
        categoryName={categoryName}
        coverImageUrl={effectiveCover}
        showCoverImage={showHeroImage}
        readMinutes={readMinutes}
        dateLabel={toDateLabel(publishedAt)}
        blocks={blocks}
        isPeerReviewed={isPeerReviewed}
      />
    </>
  );
}

function PreviewModal({
  open,
  onClose,
  warnings,
  title,
  excerpt,
  categoryName,
  coverImageUrl,
  showCoverImage,
  readMinutes,
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
  readMinutes: number;
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
            readMinutes={readMinutes}
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

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon?: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "flex items-start gap-space-sm rounded-lg border p-space-sm text-start transition-colors",
        checked
          ? "border-secondary/40 bg-secondary/[0.08]"
          : "border-outline-variant/50 hover:bg-surface-container-low",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md shrink-0",
          checked ? "bg-secondary/15 text-secondary" : "bg-surface-container text-outline",
        )}
      >
        <Icon name={icon ?? (checked ? "check_circle" : "radio_button_unchecked")} size={20} />
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-label text-label-md text-on-surface">{label}</span>
        {hint && (
          <span className="font-body text-body-sm text-outline leading-snug">{hint}</span>
        )}
      </span>
      <Icon
        name={checked ? "toggle_on" : "toggle_off"}
        size={28}
        className={cn("shrink-0 mt-0.5", checked ? "text-secondary" : "text-outline")}
      />
    </button>
  );
}
