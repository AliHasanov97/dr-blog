"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import type { ActionResult } from "@/lib/admin/types";
import { collectWarnings } from "@/lib/admin/article-helpers";
import { toDateLabel } from "@/lib/admin/format";
import {
  autosaveArticle,
  type ArticlePayload,
} from "@/app/admin/(panel)/meqaleler/actions";
import type { AdminArticle, ArticleStatus } from "@/lib/mock/store";
import type { ArticleBlock, ArticleReference, Category } from "@/lib/types";
import type { MediaScope } from "@/lib/admin/storage/scope";
import { cn } from "@/lib/utils";
import { InfoStep } from "./InfoStep";
import { ContentStep } from "./ContentStep";
import { FinishStep } from "./FinishStep";
import { PreviewModal } from "./PreviewModal";
import { StepperNav } from "./StepperNav";
import { newGuid, type CoverMode } from "./types";

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
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [isPeerReviewed, setIsPeerReviewed] = useState(
    article?.isPeerReviewed ?? false,
  );
  const [allowComments, setAllowComments] = useState(article?.allowComments ?? true);
  const [showTableOfContents, setShowTableOfContents] = useState(article?.showTableOfContents ?? true);
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? "");
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
      coverImageUrl: effectiveCover,
      showHeroImage,
      isFeatured,
      isPeerReviewed,
      allowComments,
      showTableOfContents,
      metaDescription: metaDescription.trim(),
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
      effectiveCover,
      showHeroImage,
      isFeatured,
      isPeerReviewed,
      allowComments,
      showTableOfContents,
      metaDescription,
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
    setIsFeatured(recovered.isFeatured);
    setIsPeerReviewed(recovered.isPeerReviewed);
    setAllowComments(recovered.allowComments ?? true);
    setShowTableOfContents(recovered.showTableOfContents ?? true);
    setMetaDescription(recovered.metaDescription ?? "");
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
      /* Ayrıca banner yerinə — istifadəçi Başlıq addımına aparılır və
       * konkret sahə qırmızılaşır (bax: InfoStep-ə keçirilən titleError) */
      setStepErrors(["Başlıq daxil edin"]);
      setStep(0);
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
        <div className="rounded-lg border border-tertiary/30 bg-tertiary/10 p-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm">
          <span className="flex items-start gap-space-xs font-body text-body-sm text-on-tertiary-container flex-1">
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
        <StepperNav
          steps={steps}
          step={step}
          stepErrors={stepErrors}
          onGoToStep={goToStep}
        />

        {/* Sağ panel - Məzmun */}
        <div className="flex-1 min-w-0">
          {step === 0 && (
            <InfoStep
              title={title}
              onTitleChange={setTitle}
              titleError={
                stepErrors.length > 0 && !title.trim() ? "Başlıq daxil edin" : undefined
              }
              excerpt={excerpt}
              onExcerptChange={setExcerpt}
              excerptError={
                stepErrors.length > 0 && !excerpt.trim() ? "Qısa təsvir daxil edin" : undefined
              }
              categorySlug={categorySlug}
              onCategoryChange={setCategorySlug}
              categories={categories}
              coverMode={coverMode}
              onCoverModeChange={setCoverMode}
              coverImageUrl={coverImageUrl}
              onCoverImageChange={setCoverImageUrl}
              coverOptions={coverOptions}
              coverScope={coverScope}
              onNext={() => goToStep(1)}
            />
          )}

          {step === 1 && (
            <ContentStep
              blocks={blocks}
              onChange={setBlocks}
              articleKey={articleKey}
              onBack={() => goToStep(0)}
              onNext={() => goToStep(2)}
            />
          )}

          {step === 2 && (
            <FinishStep
              references={references}
              onReferencesChange={setReferences}
              warnings={warnings}
              allowComments={allowComments}
              onAllowCommentsChange={setAllowComments}
              showTableOfContents={showTableOfContents}
              onShowTableOfContentsChange={setShowTableOfContents}
              isFeatured={isFeatured}
              onIsFeaturedChange={setIsFeatured}
              metaDescription={metaDescription}
              onMetaDescriptionChange={setMetaDescription}
              pending={pending}
              onBack={() => goToStep(1)}
              onPreview={() => setPreviewOpen(true)}
              onSaveDraft={() => save("draft")}
              onSavePublish={() => save("published")}
            />
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
        dateLabel={toDateLabel(publishedAt)}
        blocks={blocks}
        isPeerReviewed={isPeerReviewed}
      />
    </>
  );
}
