"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { useArticleLike } from "./useArticleLike";
import { cn } from "@/lib/utils";

export interface ArticleActionBarProps {
  slug: string;
  articleTitle: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  /** Şərhlər söndürülübsə düymə göstərilmir */
  showComments?: boolean;
  /** Verilməsə brauzerin öz paylaşma pəncərəsi (və ya link kopyalama) açılır */
  onShare?: () => void;
}

/** Mobil ekranda alt hissədə üzən əməliyyat paneli */
export function ArticleActionBar({
  slug,
  articleTitle,
  viewCount,
  likeCount,
  commentCount,
  showComments = true,
  onShare,
}: ArticleActionBarProps) {
  const { liked, count, toggle } = useArticleLike(slug, likeCount);
  const [copied, setCopied] = useState(false);

  /*
   * "Paylaş" düyməsi əvvəllər heç nə etmirdi — `onShare` heç yerdən
   * verilmirdi. İndi verilməyəndə brauzerin öz paylaşma pəncərəsini
   * (mobil OS-un share sheet-i) açır, dəstəklənmirsə linki kopyalayır.
   */
  async function handleShare() {
    if (onShare) {
      onShare();
      return;
    }

    const shareData = { title: articleTitle, url: window.location.href };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
      } catch {
        /* İstifadəçi pəncərəni ləğv edibsə (AbortError) — sükutla keçilir */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Panoya çıxış bloklanıbsa da heç nə etmək mümkün deyil */
    }
  }

  return (
    <div className="lg:hidden fixed bottom-24 inset-x-margin-mobile z-40">
      <div className="flex items-center justify-between gap-space-xs h-14 px-space-sm rounded-full bg-surface-bright/95 backdrop-blur-xl border border-surface-container shadow-level-2">
        <span className="inline-flex items-center gap-1 h-10 px-space-sm rounded-full text-on-surface-variant">
          <Icon name="visibility" size={20} />
          <span className="font-label text-label-sm">{viewCount.toLocaleString("az-AZ")}</span>
          <span className="sr-only">Baxış sayı</span>
        </span>
        <ActionButton
          icon={liked ? "favorite" : "favorite_border"}
          filled={liked}
          label={String(count)}
          active={liked}
          onClick={toggle}
          srLabel="Bəyən"
        />
        {showComments && (
          <ActionButton
            icon="chat_bubble_outline"
            label={String(commentCount)}
            href="#serhler"
            srLabel="Şərhlər"
          />
        )}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 h-10 px-space-md rounded-full bg-primary-container text-on-primary font-label text-label-lg"
        >
          <Icon name={copied ? "check_circle" : "share"} size={18} />
          {copied ? "Kopyalandı" : "Paylaş"}
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  active,
  filled,
  onClick,
  href,
  srLabel,
}: {
  icon: string;
  label?: string;
  active?: boolean;
  filled?: boolean;
  onClick?: () => void;
  href?: string;
  srLabel: string;
}) {
  const content = (
    <>
      <Icon name={icon} size={20} filled={filled} />
      {label && <span className="font-label text-label-sm">{label}</span>}
      <span className="sr-only">{srLabel}</span>
    </>
  );

  const cls = cn(
    "inline-flex items-center gap-1 h-10 px-space-sm rounded-full transition-colors",
    active ? "text-secondary bg-secondary/10" : "text-on-surface-variant hover:bg-surface-container-low",
  );

  if (href) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}
