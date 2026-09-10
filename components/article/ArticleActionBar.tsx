"use client";

import { Icon } from "@/components/ui";
import { useArticleLike } from "./useArticleLike";
import { cn } from "@/lib/utils";

export interface ArticleActionBarProps {
  slug: string;
  likeCount: number;
  commentCount: number;
  /** Şərhlər söndürülübsə düymə göstərilmir */
  showComments?: boolean;
  onShare?: () => void;
}

/** Mobil ekranda alt hissədə üzən əməliyyat paneli */
export function ArticleActionBar({
  slug,
  likeCount,
  commentCount,
  showComments = true,
  onShare,
}: ArticleActionBarProps) {
  const { liked, count, toggle } = useArticleLike(slug, likeCount);

  return (
    <div className="lg:hidden fixed bottom-24 inset-x-margin-mobile z-40">
      <div className="flex items-center justify-between gap-space-xs h-14 px-space-sm rounded-full bg-surface-bright/95 backdrop-blur-xl border border-surface-container shadow-level-2">
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
          onClick={onShare}
          className="inline-flex items-center gap-1.5 h-10 px-space-md rounded-full bg-primary-container text-on-primary font-label text-label-lg"
        >
          <Icon name="share" size={18} />
          Paylaş
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
