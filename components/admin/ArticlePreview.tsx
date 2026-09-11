"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ArticleBody } from "@/components/article/ArticleBody";
import { Badge, Icon } from "@/components/ui";
import type { ArticleBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  categoryName: string;
  coverImageUrl: string;
  /** Örtük şəklinin məqalənin başında göstərilməsi (admin açarı) */
  showCoverImage?: boolean;
  dateLabel: string;
  authorName: string;
  blocks: ArticleBlock[];
  isPeerReviewed?: boolean;
  /**
   * `panel` — formanın yanındakı dar sütun (kiçildilmiş görünüş).
   * `full` — saytdakı real oxu eni; şəkillərin mətnə görə yerləşməsi
   * (`align="left"/"right"`) məhz bu rejimdə olduğu kimi görünür.
   */
  variant?: "panel" | "full";
  /** Başlıq zolağının sağındakı düymələr */
  headerAction?: ReactNode;
}

/**
 * Canlı önəbaxış — məqalənin saytda necə görünəcəyi.
 * Publik saytdakı `ArticleBody` komponentini işlədir, ona görə göstərilən
 * nəticə real səhifə ilə eynidir.
 */
export function ArticlePreview({
  title,
  excerpt,
  categoryName,
  coverImageUrl,
  showCoverImage = true,
  dateLabel,
  authorName,
  blocks,
  isPeerReviewed,
  variant = "panel",
  headerAction,
}: ArticlePreviewProps) {
  const full = variant === "full";

  return (
    <div
      className={cn(
        "rounded-xl border border-surface-container bg-surface overflow-hidden",
        full && "flex flex-col max-h-full",
      )}
    >
      <div className="flex items-center gap-space-xs px-space-md h-10 border-b border-surface-container bg-surface-container-low shrink-0">
        <Icon name="visibility" size={16} className="text-secondary" />
        <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">
          {full ? "Saytdakı real ölçü" : "Saytda belə görünəcək"}
        </span>
        {headerAction && (
          <span className="ms-auto flex items-center gap-1">{headerAction}</span>
        )}
      </div>

      <div
        className={cn(
          "overflow-y-auto",
          full ? "p-space-lg flex-1" : "p-space-md max-h-[70vh]",
        )}
      >
        <article
          className={cn(
            "flex flex-col gap-space-md",
            /* Saytdakı məqalə sütunu ilə eyni en — sətir uzunluğu da eyni olur */
            full && "mx-auto w-full max-w-[46rem]",
          )}
        >
          <div className="flex items-center flex-wrap gap-x-space-sm gap-y-1 font-label text-label-sm text-outline">
            <span className="text-secondary font-semibold">{categoryName}</span>
            <span aria-hidden="true">•</span>
            <span>{dateLabel}</span>
          </div>

          <h1
            className={cn(
              "font-headline text-on-surface leading-tight",
              full ? "text-headline-lg" : "text-headline-lg-mobile",
            )}
          >
            {title || "Başlıq buraya yazılacaq"}
          </h1>

          {excerpt && (
            <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
              {excerpt}
            </p>
          )}

          <div className="flex items-center gap-space-xs">
            <span className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
              <Icon name="history_edu" size={16} />
            </span>
            <span className="font-label text-label-md text-on-surface">
              {authorName}
            </span>
            {isPeerReviewed && (
              <Badge tone="solid" icon="verified">
                Resenziyalı
              </Badge>
            )}
          </div>

          {coverImageUrl && showCoverImage && (
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-surface-container">
              <Image
                src={coverImageUrl}
                alt=""
                fill
                sizes={full ? "740px" : "600px"}
                className="object-cover"
              />
            </div>
          )}

          {blocks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-outline-variant py-space-lg text-center font-body text-body-sm text-outline">
              Mətn hissəsi hələ boşdur — aşağıda bölmə əlavə edin.
            </p>
          ) : (
            <ArticleBody blocks={blocks} />
          )}
        </article>
      </div>
    </div>
  );
}
