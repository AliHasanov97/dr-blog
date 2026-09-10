"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ConfirmButton,
  DataCell,
  DataRow,
  DataTable,
  StatusPill,
} from "@/components/admin";
import { Button, Chip, Icon, SearchBar } from "@/components/ui";
import { articleStatusLabels } from "@/lib/admin/format";
import type { AdminArticle, ArticleStatus } from "@/lib/mock/store";
import type { AdminArticleListResult } from "@/lib/db/admin";
import { deleteArticle, fetchAdminArticles, setArticleStatus } from "./actions";

export interface ArticleListClientProps {
  /** Serverdə hazırlanmış ilk səhifə və sayğaclar */
  initial: AdminArticleListResult;
  pageSize: number;
}

/** Yazı yazılarkən hər hərfdə sorğu getməsin deyə gözləmə müddəti */
const SEARCH_DELAY = 300;

const filters: { slug: ArticleStatus | "all"; name: string; icon: string }[] = [
  { slug: "all", name: "Hamısı", icon: "apps" },
  { slug: "published", name: "Saytda görünür", icon: "public" },
  { slug: "draft", name: "Qaralama", icon: "edit_note" },
  { slug: "review", name: "Yoxlanılır", icon: "visibility" },
];

const statusTone = {
  published: "success",
  review: "warning",
  draft: "neutral",
} as const;

/** Consistent number formatting to avoid hydration mismatch */
function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function ArticleListClient({
  initial,
  pageSize,
}: ArticleListClientProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ArticleStatus | "all">("all");
  const [pending, startTransition] = useTransition();

  const [visible, setVisible] = useState(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [counts, setCounts] = useState(initial.counts);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);

  const load = useCallback(
    async (nextPage: number, q: string, st: ArticleStatus | "all", append: boolean) => {
      const result = await fetchAdminArticles({
        search: q,
        status: st,
        page: nextPage,
        pageSize,
      });
      setVisible((prev) => (append ? [...prev, ...result.items] : result.items));
      setTotal(result.total);
      setCounts(result.counts);
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
        await load(1, query, status, false);
      });
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [query, status, load]);

  /** Bir kliklə saytda göstər / gizlət */
  function toggleVisibility(article: AdminArticle) {
    const next: ArticleStatus =
      article.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setArticleStatus(article.id, next);
      /* Sayğaclar və siyahı serverdəki yeni vəziyyətə uyğunlaşır */
      await load(1, query, status, false);
    });
  }

  return (
    <div className="flex flex-col gap-space-md">
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
        <div className="lg:w-80 shrink-0">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Başlıq, slug və ya kateqoriya..."
          />
        </div>
      </div>

      <div className="rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-1 overflow-hidden">
        <DataTable
          headers={[
            { key: "title", label: "Məqalə" },
            { key: "category", label: "Kateqoriya" },
            { key: "status", label: "Vəziyyət" },
            { key: "date", label: "Tarix" },
            { key: "views", label: "Oxunma", className: "text-end" },
            { key: "reactions", label: "Oxucu rəyi", className: "text-end" },
            { key: "actions", label: "", className: "text-end" },
          ]}
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
                    href={`/meqaleler/${article.slug}`}
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
                    onConfirm={() => deleteArticle(article.id)}
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
                  await load(page + 1, query, status, true);
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
