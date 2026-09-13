"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArticleCard } from "./ArticleCard";
import {
  Button,
  ChipGroup,
  EmptyState,
  SearchBar,
  SectionHeader,
} from "@/components/ui";
import { fetchArticlePage } from "@/app/[locale]/(site)/articles/actions";
import type { ArticleSummary, Category } from "@/lib/types";

export interface ArticleExplorerProps {
  /** Serverdə hazırlanmış ilk səhifə */
  articles: ArticleSummary[];
  /** Filtrsiz ümumi məqalə sayı */
  total: number;
  /** Səhifə başına məqalə (admin parametrindən) */
  pageSize: number;
  categories: Category[];
  /** Ayrıca göstərilən «Ayın Əsas Məqaləsi» — siyahıdan çıxarılır */
  featuredSlug?: string;
  /** URL-dəki ?q= dəyəri (header axtarışından gəlir) */
  initialQuery?: string;
}

/** Yazı yazılarkən hər hərfdə sorğu getməsin deyə gözləmə müddəti */
const SEARCH_DELAY = 300;

/**
 * Bloq səhifəsinin əsas kataloqu: axtarış + kateqoriya filtrləri + siyahı.
 *
 * Axtarış və filtrləmə serverdə aparılır. Əvvəllər bütün iş brauzerdə
 * görülürdü — serverdən gələn məhdud siyahının içində. Məqalə sayı artdıqca
 * qalanları nə filtrdə, nə axtarışda görünürdü; indi bütün baza üzrə işləyir
 * və siyahı «Daha çox» düyməsi ilə hissə-hissə yüklənir.
 */
export function ArticleExplorer({
  articles,
  total,
  pageSize,
  categories,
  featuredSlug,
  initialQuery = "",
}: ArticleExplorerProps) {
  const t = useTranslations("articles");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "hamisi");
  const headingRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState(articles);
  const [matchCount, setMatchCount] = useState(total);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(total / pageSize)),
  );
  const [pending, startTransition] = useTransition();

  /* Header axtarışından gəlindikdə nəticələrə sürüş (state dəyişmir) */
  useEffect(() => {
    if (!initialQuery) return;
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialQuery]);

  const load = useCallback(
    async (nextPage: number, q: string, slug: string, append: boolean) => {
      const result = await fetchArticlePage({
        query: q,
        categorySlug: slug,
        page: nextPage,
        pageSize,
        excludeSlug: featuredSlug,
        locale,
      });
      setItems((prev) =>
        append ? [...prev, ...result.items] : result.items,
      );
      setMatchCount(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    },
    [pageSize, featuredSlug, locale],
  );

  /*
   * Filtr dəyişəndə siyahı birinci səhifədən yenidən qurulur.
   * `skipFirst` ilk render-də sorğunun təkrarlanmasının qarşısını alır —
   * server onsuz da ilk səhifəni hazır göndərib.
   */
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        await load(1, query, activeSlug, false);
      });
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query, activeSlug, load]);

  function loadMore() {
    startTransition(async () => {
      await load(page + 1, query, activeSlug, true);
    });
  }

  /* Əsas məqalə sorğuda kənarlaşdırılıb — burada süzgəcə ehtiyac yoxdur */
  const visible = items;
  const hasMore = page < totalPages;

  return (
    <section ref={headingRef} className="flex flex-col gap-space-md scroll-mt-28">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={t("explorerSearchPlaceholder")}
        clearLabel={t("clearSearch")}
      />

      <ChipGroup
        items={categories}
        activeSlug={activeSlug}
        onChange={setActiveSlug}
        showCounts
      />

      <SectionHeader
        title={t("explorerTitle")}
        icon="library_books"
        hint={
          pending && visible.length === 0
            ? t("searching")
            : t("resultsCount", { count: matchCount })
        }
      />

      {visible.length === 0 ? (
        pending ? (
          <p className="py-space-xl text-center font-body text-body-md text-outline">
            {t("loadingEllipsis")}
          </p>
        ) : (
          <EmptyState
            title={t("emptyCategoryTitle")}
            description={t("emptyCategoryHint")}
          />
        )
      ) : (
        <div className="flex flex-col gap-space-md">
          {visible.map((article) => (
            <ArticleCard key={article.id} article={article} variant="list" />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex flex-col items-center gap-space-2xs pt-space-xs">
          <Button
            variant="tonal"
            icon={pending ? undefined : "expand_more"}
            disabled={pending}
            onClick={loadMore}
          >
            {pending ? t("loadingEllipsis") : t("loadMore")}
          </Button>
          <span className="font-label text-label-sm text-outline">
            {visible.length} / {matchCount}
          </span>
        </div>
      )}
    </section>
  );
}
