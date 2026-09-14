"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ConfirmButton,
  DataCell,
  DataRow,
  DataTable,
  LanguageFilterCards,
  StatusPill,
  type ContentLanguageFilter,
} from "@/components/admin";
import { isMultiLanguageEnabled, type AppLocale } from "@/i18n/routing";
import { Button, Chip, FLAGS, Icon, SearchBar } from "@/components/ui";
import { articleStatusLabels } from "@/lib/admin/format";
import type { AdminArticle, ArticleStatus } from "@/lib/mock/store";
import type { AdminArticleListResult, AdminArticleQuery } from "@/lib/db/admin";
import { deleteArticle, fetchAdminArticles, setArticleStatus } from "./actions";

export interface ArticleListClientProps {
  /** Serverdə hazırlanmış ilk səhifə və sayğaclar */
  initial: AdminArticleListResult;
  pageSize: number;
  categories: { slug: string; name: string }[];
}

type SortBy = NonNullable<AdminArticleQuery["sortBy"]>;
type SortDir = NonNullable<AdminArticleQuery["sortDir"]>;

/** Yazı yazılarkən hər hərfdə sorğu getməsin deyə gözləmə müddəti */
const SEARCH_DELAY = 300;

const filters: { slug: ArticleStatus | "all"; name: string; icon: string }[] = [
  { slug: "all", name: "Hamısı", icon: "apps" },
  { slug: "published", name: "Saytda görünür", icon: "public" },
  { slug: "draft", name: "Qaralama", icon: "edit_note" },
];

type Language = AppLocale;

const statusTone = {
  published: "success",
  draft: "neutral",
} as const;

/** Yeni sütuna keçəndə standart istiqamət — mətn sütunları A→Z, ədədi/tarix sütunları böyükdən kiçiyə */
function defaultDirFor(key: SortBy): SortDir {
  return key === "title" || key === "category" || key === "status" || key === "language"
    ? "asc"
    : "desc";
}

/** Consistent number formatting to avoid hydration mismatch */
function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function ArticleListClient({
  initial,
  pageSize,
  categories,
}: ArticleListClientProps) {
  const languageSupport = isMultiLanguageEnabled();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ArticleStatus | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [language, setLanguage] = useState<Language | "all">("all");
  /* Standart: ən yeni məqalə başda */
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pending, startTransition] = useTransition();

  const [visible, setVisible] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [counts, setCounts] = useState(initial.counts);
  const [languageCounts, setLanguageCounts] = useState(initial.languageCounts);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);

  const load = useCallback(
    async (
      nextPage: number,
      q: string,
      st: ArticleStatus | "all",
      cat: string,
      lang: Language | "all",
      sBy: SortBy,
      sDir: SortDir,
      append: boolean,
    ) => {
      const result = await fetchAdminArticles({
        search: q,
        status: st,
        category: cat === "all" ? undefined : cat,
        language: lang,
        sortBy: sBy,
        sortDir: sDir,
        page: nextPage,
        pageSize,
      });
      setVisible((prev) => (append ? [...prev, ...result.items] : result.items));
      setTotal(result.total);
      setCounts(result.counts);
      setLanguageCounts(result.languageCounts);
      setPage(result.page);
      setTotalPages(result.totalPages);
    },
    [pageSize],
  );

  /*
   * Axtarış və ya süzgəc dəyişəndə siyahı birinci səhifədən yenidən qurulur.
   * `skipFirst` ilk render-də təkrar sorğunun qarşısını alır — server onsuz
   * da ilk səhifəni hazır göndərib.
   */
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        await load(1, query, status, category, language, sortBy, sortDir, false);
      });
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sortBy/sortDir dəyişəndə `handleSortChange` sorğunu dərhal göndərir, bura ikiqat sorğunun qarşısını almaq üçün əlavə edilmir
  }, [query, status, category, language, load]);

  /** Sütun başlığına klikləyəndə sıralanır — eyni sütuna təkrar klik istiqaməti dəyişir */
  function handleSortChange(key: string) {
    const nextBy = key as SortBy;
    const nextDir: SortDir =
      sortBy === nextBy ? (sortDir === "asc" ? "desc" : "asc") : defaultDirFor(nextBy);
    setSortBy(nextBy);
    setSortDir(nextDir);
    startTransition(async () => {
      await load(1, query, status, category, language, nextBy, nextDir, false);
    });
  }

  /** Bir kliklə saytda göstər / gizlət */
  function toggleVisibility(article: AdminArticle) {
    const next: ArticleStatus =
      article.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setArticleStatus(article.id, next);
      /* Sayğaclar və siyahı serverdəki yeni vəziyyətə uyğunlaşır */
      await load(1, query, status, category, language, sortBy, sortDir, false);
    });
  }

  /** Silindikdən sonra siyahı serverdəki yeni vəziyyətə uyğunlaşır */
  async function handleDelete(id: string) {
    await deleteArticle(id);
    await load(page, query, status, category, language, sortBy, sortDir, false);
  }

  return (
    <div className="flex flex-col gap-space-md">
      {languageSupport && (
        <LanguageFilterCards
          value={language}
          onChange={(v: ContentLanguageFilter) => setLanguage(v)}
          counts={languageCounts}
        />
      )}

      <div className="flex flex-col gap-space-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-space-xs overflow-x-auto scrollbar-none">
          {filters.map((f) => (
            <Chip
              key={f.slug}
              label={f.name}
              icon={f.icon}
              active={status === f.slug}
              /* Sayğaclar bütün baza üzrədir — yüklənmiş səhifəyə görə deyil */
              count={counts[f.slug]}
              onClick={() => setStatus(f.slug)}
            />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs">
          <div className="relative sm:w-52 shrink-0">
            <label htmlFor="category-filter" className="sr-only">
              Kateqoriya
            </label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 pl-space-md pr-10 rounded-xl bg-surface-container-low text-on-surface font-body text-body-sm border-none outline-none focus:ring-1 focus:ring-primary/40 appearance-none"
            >
              <option value="all">Bütün kateqoriyalar</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              size={20}
              className="absolute right-space-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            />
          </div>
          <div className="lg:w-72 shrink-0">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Başlıq, slug və ya kateqoriya..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-1 overflow-hidden">
        <DataTable
          headers={[
            { key: "title", label: "Məqalə", sortable: true },
            ...(languageSupport
              ? [{ key: "language", label: "Dil", sortable: true }]
              : []),
            { key: "category", label: "Kateqoriya", sortable: true },
            { key: "status", label: "Vəziyyət", sortable: true },
            { key: "date", label: "Tarix", sortable: true },
            { key: "views", label: "Oxunma", className: "text-end", sortable: true },
            { key: "reactions", label: "Oxucu rəyi", className: "text-end", sortable: true },
            { key: "actions", label: "", className: "text-end" },
          ]}
          sortKey={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          isEmpty={visible.length === 0}
          emptyLabel="Bu filtrə uyğun məqalə yoxdur."
        >
          {visible.map((article) => (
            <DataRow key={article.id}>
              <DataCell>
                <Link
                  href={`/admin/meqaleler/${article.id}`}
                  className="flex flex-col gap-0.5 max-w-md group"
                >
                  <span className="font-label text-label-lg text-on-surface line-clamp-2 group-hover:text-secondary transition-colors">
                    {article.title}
                  </span>
                  <span className="font-label text-label-sm text-outline truncate">
                    /{article.slug}
                  </span>
                </Link>
              </DataCell>
              {languageSupport && (
                <DataCell>
                  {(() => {
                    const Flag = FLAGS[article.language as keyof typeof FLAGS];
                    return (
                      <span className="inline-flex items-center gap-space-2xs">
                        {Flag && (
                          <Flag className="w-6 h-[18px] shrink-0 rounded-[3px] object-cover ring-1 ring-outline-variant/60" />
                        )}
                        <span className="font-label text-label-sm font-semibold text-on-surface-variant uppercase tracking-wide">
                          {article.language.toUpperCase()}
                        </span>
                      </span>
                    );
                  })()}
                </DataCell>
              )}
              <DataCell>
                <span className="font-body text-body-sm text-on-surface-variant whitespace-nowrap">
                  {article.category.name}
                </span>
              </DataCell>
              <DataCell>
                <button
                  type="button"
                  onClick={() => toggleVisibility(article)}
                  disabled={pending}
                  title={
                    article.status === "published"
                      ? "Klikləyin — saytdan gizlədilsin"
                      : "Klikləyin — saytda göstərilsin"
                  }
                  className="inline-flex items-center gap-1 disabled:opacity-50 group/status"
                >
                  <StatusPill
                    label={articleStatusLabels[article.status]}
                    tone={statusTone[article.status]}
                    icon={article.status === "published" ? "visibility" : "visibility_off"}
                  />
                  <Icon
                    name="swap_horiz"
                    size={14}
                    className="text-outline opacity-0 group-hover/status:opacity-100 transition-opacity"
                  />
                </button>
              </DataCell>
              <DataCell>
                <span className="font-label text-label-sm text-outline whitespace-nowrap">
                  {article.publishedAtLabel}
                </span>
              </DataCell>
              <DataCell className="text-end">
                <span className="font-label text-label-md text-on-surface-variant tabular-nums">
                  {formatNumber(article.viewCount ?? 0)}
                </span>
              </DataCell>
              <DataCell className="text-end">
                {/* «Bu məqalə faydalı oldu?» blokunun nəticəsi */}
                <span className="inline-flex items-center gap-space-xs font-label text-label-sm text-on-surface-variant tabular-nums whitespace-nowrap">
                  <span title="Çox aydın və faydalı">
                    👍 {article.reactions?.clear ?? 0}
                  </span>
                  <span title="Yeni məlumat öyrəndim">
                    💡 {article.reactions?.learned ?? 0}
                  </span>
                  <span title="Həkimə sualım var">
                    ❓ {article.reactions?.question ?? 0}
                  </span>
                </span>
              </DataCell>
              <DataCell className="text-end whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    title="Saytda necə göründüyünə bax"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <Icon name="open_in_new" size={16} />
                  </Link>
                  <Link
                    href={`/admin/meqaleler/${article.id}`}
                    title="Redaktə et"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <Icon name="edit" size={16} />
                  </Link>
                  <ConfirmButton
                    onConfirm={() => handleDelete(article.id)}
                    itemName={article.title}
                    question="Bu məqaləni silmək istəyirsiniz?"
                  />
                </span>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      </div>

      {/*
        * Altlıq siyahı boş olmayanda həmişə görünür: neçə məqalənin
        * göstərildiyi bilinsin deyə. Düymə isə yalnız qalan varsa çıxır.
        */}
      {visible.length > 0 && (
        <div className="flex flex-col items-center gap-space-2xs">
          {page < totalPages && (
            <Button
              variant="tonal"
              size="sm"
              icon={pending ? undefined : "expand_more"}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await load(page + 1, query, status, category, language, sortBy, sortDir, true);
                })
              }
            >
              {pending ? "Yüklənir..." : "Daha çox məqalə"}
            </Button>
          )}
          <span className="font-label text-label-sm text-outline tabular-nums">
            {visible.length} / {total} məqalə göstərilir
            {totalPages > 1 && ` · səhifə ${page}/${totalPages}`}
          </span>
        </div>
      )}
    </div>
  );
}
