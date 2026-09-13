"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui";
import { useArticleLike } from "./useArticleLike";
import { cn } from "@/lib/utils";

export interface ArticleStatsProps {
  slug: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

/**
 * Yan sütundakı statistika.
 * «Bəyənmə» sadəcə rəqəm deyil — desktopda məqaləni bəyənməyin yeganə
 * yeridir (mobil versiyada alt panel var).
 */
export function ArticleStats({
  slug,
  viewCount,
  likeCount,
  commentCount,
}: ArticleStatsProps) {
  const t = useTranslations("article");
  const { liked, count, toggle } = useArticleLike(slug, likeCount);

  return (
    <div className="grid grid-cols-3 gap-space-xs">
      <Stat icon="visibility" value={viewCount} label={t("statViews")} />
      <Stat
        icon={liked ? "favorite" : "favorite_border"}
        value={count}
        label={liked ? t("statLiked") : t("statLike")}
        filled={liked}
        active={liked}
        onClick={toggle}
        title={liked ? t("unlikeTitle") : t("likeTitle")}
      />
      <Stat icon="forum" value={commentCount} label={t("statComments")} href="#serhler" />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  filled,
  active,
  onClick,
  href,
  title,
}: {
  icon: string;
  value: number;
  label: string;
  filled?: boolean;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  title?: string;
}) {
  const locale = useLocale();
  const body = (
    <>
      <Icon
        name={icon}
        size={18}
        filled={filled}
        className={active ? "text-secondary" : "text-secondary"}
      />
      <span className="font-headline text-headline-sm text-on-surface">
        {value.toLocaleString(locale)}
      </span>
      <span className="font-label text-label-sm text-outline">{label}</span>
    </>
  );

  const cls = cn(
    "flex flex-col items-center gap-0.5 rounded-lg py-space-xs transition-colors",
    active ? "bg-secondary/10" : "bg-surface-container-low",
    (onClick || href) && "hover:bg-secondary/15 cursor-pointer",
  );

  if (href) {
    return (
      <a href={href} className={cls} title={title}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} title={title} aria-pressed={active}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}
