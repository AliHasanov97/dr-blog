"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/articles";
import { ChipGroup, EmptyState, SearchBar, SectionHeader } from "@/components/ui";
import type { ArticleSummary, Category } from "@/lib/types";

export interface HomeArticleFeedProps {
  articles: ArticleSummary[];
  filters: Category[];
}

/**
 * Landing-in məqalə bölməsi: bir böyük redaksiya kartı + 3 sütunlu grid.
 * Axtarış və tab filtrləri klient tərəfində işləyir (mock mərhələsi).
 */
export function HomeArticleFeed({ articles, filters }: HomeArticleFeedProps) {
  const t = useTranslations("home");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]?.slug ?? "");

  const visible = useMemo(() => {
    let result = [...articles];

    if (activeFilter === "populyar") {
      result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else if (activeFilter === "klinik-icmallar") {
      result = result.filter((a) => a.isPeerReviewed);
    } else if (activeFilter === "profilaktika") {
      result = result.filter((a) => a.category.slug === "profilaktika");
    }

    if (query.trim()) {
      const q = query.toLocaleLowerCase("az");
      result = result.filter(
        (a) =>
          a.title.toLocaleLowerCase("az").includes(q) ||
          a.excerpt.toLocaleLowerCase("az").includes(q),
      );
    }

    return result;
  }, [articles, activeFilter, query]);

  const [lead, ...rest] = visible;

  return (
    <section className="flex flex-col gap-space-lg">
      <SectionHeader
        kicker={t("editorialKicker")}
        title={t("articlesSectionTitle")}
        icon="auto_stories"
        actionLabel={t("allArticles")}
        actionHref="/articles"
      />

      <div className="flex flex-col gap-space-sm lg:flex-row lg:items-center lg:justify-between">
        <ChipGroup
          items={filters}
          activeSlug={activeFilter}
          onChange={setActiveFilter}
          className="lg:flex-1"
        />
        <div className="lg:w-80 shrink-0">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t("searchPlaceholder")}
            clearLabel={t("clearSearch")}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={t("noResultsTitle")}
          description={t("noResultsHint")}
        />
      ) : (
        <div className="flex flex-col gap-space-lg">
          {lead && <ArticleCard article={lead} variant="featured" priority />}
          {rest.length > 0 && (
            <div className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {rest.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
