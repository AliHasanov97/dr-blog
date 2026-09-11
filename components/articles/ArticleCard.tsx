import Image from "next/image";
import Link from "next/link";
import { Badge, Card, Icon } from "@/components/ui";
import { ArticleMeta } from "./ArticleMeta";
import type { ArticleSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  article: ArticleSummary;
  /**
   * `featured` — böyük redaksiya kartı (desktopda 2 sütunlu)
   * `grid`     — şəkilli grid kartı
   * `compact`  — şəkilsiz mətn kartı
   * `list`     — yan şəkilli sətir kartı
   */
  variant?: "featured" | "grid" | "compact" | "list";
  priority?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  variant = "compact",
  priority = false,
  className,
}: ArticleCardProps) {
  const href = `/meqaleler/${article.slug}`;

  /* ---------------- Featured ---------------- */
  if (variant === "featured") {
    return (
      <Card
        padded={false}
        interactive
        className={cn("group overflow-hidden", className)}
      >
        <Link href={href} className="flex flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
          <div className="relative w-full h-52 sm:h-64 lg:h-full lg:min-h-[22rem] overflow-hidden">
            {article.coverImageUrl ? (
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                sizes="(min-width: 1024px) 40rem, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority={priority}
              />
            ) : (
              <CoverFallback icon={article.category.icon} size={72} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container/55 via-transparent to-primary-container/25" />
            {article.isPeerReviewed && (
              <div className="absolute top-space-sm inset-x-space-sm flex items-start">
                <Badge tone="solid" icon="verified">
                  Resenziyalı Nəşr
                </Badge>
              </div>
            )}
          </div>

          <div className="p-card-padding lg:p-space-xl flex flex-col gap-space-xs justify-center">
            <ArticleMeta
              categoryName={article.category.name}
              dateLabel={article.publishedAtLabel}
              referenceLabel={article.referenceLabel}
            />
            <h3 className="font-headline text-headline-md lg:text-headline-lg text-on-surface leading-snug text-balance">
              {article.title}
            </h3>
            <p className="font-body text-body-sm lg:text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
              {article.excerpt}
            </p>

            <div className="pt-space-sm mt-space-2xs border-t border-surface-container flex items-center justify-between gap-space-sm">
              <span className="flex items-center gap-space-xs min-w-0">
                <Image
                  src={article.author.avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-tertiary-fixed-dim/40"
                />
                <span className="font-label text-label-sm font-semibold text-on-surface truncate">
                  {article.author.fullName}
                </span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-lg font-semibold text-secondary">
                Məqaləni Oxu
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  /* ---------------- Grid (şəkilli) ---------------- */
  if (variant === "grid") {
    return (
      <Card
        padded={false}
        interactive
        className={cn("group overflow-hidden flex flex-col h-full", className)}
      >
        <Link href={href} className="flex flex-col h-full">
          <div className="relative w-full aspect-[16/10] overflow-hidden shrink-0">
            {article.coverImageUrl ? (
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                sizes="(min-width: 1024px) 24rem, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <CoverFallback icon={article.category.icon} size={48} />
            )}
            <span className="absolute top-space-xs left-space-xs">
              <Badge tone="paper">
                {article.category.name}
              </Badge>
            </span>
          </div>

          <div className="p-space-md flex flex-col gap-space-2xs flex-1">
            <ArticleMeta dateLabel={article.publishedAtLabel} />
            <h3 className="font-headline text-headline-sm text-on-surface leading-snug line-clamp-2">
              {article.title}
            </h3>
            <p className="font-body text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
              {article.excerpt}
            </p>
            <span className="mt-auto pt-space-sm inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
              İcmala bax
              <Icon
                name="arrow_forward"
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </Link>
      </Card>
    );
  }

  /* ---------------- List ---------------- */
  if (variant === "list") {
    return (
      <Card interactive className={cn("group p-space-md", className)}>
        <Link href={href} className="flex gap-space-md">
          {article.coverImageUrl && (
            <div className="relative w-24 h-24 sm:w-36 sm:h-28 shrink-0 rounded-lg overflow-hidden">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-space-2xs min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-label text-label-sm font-semibold text-secondary">
                {article.category.name}
              </span>
              <span className="text-outline text-label-sm" aria-hidden="true">•</span>
              <span className="font-label text-label-sm text-outline">
                {article.publishedAtLabel}
              </span>
            </div>
            <h3 className="font-headline text-headline-sm lg:text-headline-md text-on-surface leading-snug line-clamp-2">
              {article.title}
            </h3>
            <p className="font-body text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
            <ArticleMeta
              referenceLabel={article.referenceLabel}
              className="pt-space-2xs"
            />
          </div>
        </Link>
      </Card>
    );
  }

  /* ---------------- Compact ---------------- */
  return (
    <Card interactive className={cn("group flex flex-col gap-space-xs h-full", className)}>
      <Link href={href} className="flex flex-col gap-space-xs h-full">
        <h3 className="font-headline text-headline-sm text-on-surface leading-snug">
          {article.title}
        </h3>
        <p className="font-body text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="pt-space-2xs mt-auto flex items-center justify-between gap-space-xs">
          <span className="inline-flex items-center gap-1 font-label text-label-sm text-outline min-w-0">
            <Icon name="menu_book" size={14} />
            <span className="truncate">{article.referenceLabel ?? article.category.name}</span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-0.5 font-label text-label-sm font-semibold text-secondary">
            İcmala Bax
            <Icon
              name="arrow_forward"
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}

/**
 * Şəkilsiz məqalələr üçün örtük yeri.
 * Admin «Şəkilsiz» rejimini seçdikdə kartda boş boz sahə qalmasın deyə
 * mövzunun ikonu ilə doldurulur.
 */
function CoverFallback({ icon, size }: { icon?: string; size: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high"
    >
      <Icon
        name={icon ?? "auto_stories"}
        size={size}
        className="text-tertiary-fixed-dim/35"
      />
    </div>
  );
}
