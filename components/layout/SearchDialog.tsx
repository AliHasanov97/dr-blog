"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Icon } from "@/components/ui";
import { Link, useRouter } from "@/i18n/navigation";
import { searchArticles } from "@/app/[locale]/(site)/actions";
import type { SearchIndexItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  /** Qutu boş olduqda göstərilən təkliflər (ən yeni məqalələr) */
  suggestions: SearchIndexItem[];
}

/** Hər hərfdə sorğu getməsin deyə gözləmə müddəti */
const SEARCH_DELAY = 250;

const MAX_RESULTS = 6;

/** Azərbaycan hərflərini nəzərə alan sadə normallaşdırma */
function normalize(value: string): string {
  return value.toLocaleLowerCase("az").trim();
}

function scoreItem(item: SearchIndexItem, q: string): number {
  const title = normalize(item.title);
  const excerpt = normalize(item.excerpt);
  const category = normalize(item.categoryName);

  if (title.startsWith(q)) return 100;
  if (title.includes(q)) return 80;
  if (category.includes(q)) return 40;
  if (excerpt.includes(q)) return 20;
  return 0;
}

/** Uyğun gələn hissəni qalın göstərir */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = normalize(text).indexOf(query);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-secondary/20 text-on-secondary-container rounded-sm px-0.5">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

/**
 * Header axtarışı — modal overlay.
 * Cmd/Ctrl+K ilə açılır, Esc ilə bağlanır, ox düymələri ilə naviqasiya olunur.
 */
export function SearchDialog({
  open,
  onClose,
  suggestions,
}: SearchDialogProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const q = normalize(query);

  /*
   * Axtarış serverdə aparılır — bütün baza üzrə. Nəticə hansı sorğuya
   * aid olduğu ilə birlikdə saxlanılır: belə olanda köhnə sorğunun
   * nəticəsi yeni sorğu yazılarkən ekranda qalmır.
   */
  const [matches, setMatches] = useState<{
    query: string;
    items: SearchIndexItem[];
  }>({ query: "", items: [] });

  useEffect(() => {
    if (!open || q.length < 2) return;
    let active = true;
    const timer = setTimeout(() => {
      searchArticles(q).then((items) => {
        if (active) setMatches({ query: q, items });
      });
    }, SEARCH_DELAY);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, q]);

  /* Nəticə hələ gəlməyibsə — sorğu dəyişib, cavab isə köhnədir */
  const loading = q.length >= 2 && matches.query !== q;

  const results = useMemo(() => {
    if (q.length < 2) return suggestions.slice(0, MAX_RESULTS);
    if (matches.query !== q) return [];
    /* Gələn kiçik dəst burada sıralanır ki, başlıqla başlayan
     * uyğunluq yuxarı çıxsın. */
    return matches.items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((r) => r.item);
  }, [suggestions, matches, q]);

  /* Sorğu dəyişəndə indeks siyahıdan kənara çıxa bilər — render zamanı sıxılır */
  const active = results.length ? Math.min(activeIndex, results.length - 1) : 0;

  /* Fokus + fon scroll kilidi (state dəyişmir — yalnız DOM ilə sinxronizasiya) */
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 40);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* Aktiv nəticəni görünən sahəyə gətir */
  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/articles/${slug}`);
    },
    [onClose, router],
  );

  const submitAll = useCallback(() => {
    onClose();
    router.push(query.trim() ? `/articles?q=${encodeURIComponent(query.trim())}` : "/articles");
  }, [onClose, query, router]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = results[active];
      if (target) go(target.slug);
      else submitAll();
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("dialogAriaLabel")}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[60] flex items-start justify-center px-margin-mobile pt-24 lg:pt-32"
    >
      {/* Fon */}
      <button
        type="button"
        aria-label={t("closeAriaLabel")}
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/45 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
      />

      <div className="relative w-full max-w-2xl rounded-xl bg-surface-container-lowest border border-surface-container shadow-level-2 overflow-hidden">
        {/* Axtarış sahəsi */}
        <div className="flex items-center gap-space-sm px-space-md h-14 border-b border-surface-container">
          <Icon name="search" size={20} className="text-outline" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={t("placeholder")}
            aria-label={t("inputAriaLabel")}
            className="flex-1 bg-transparent border-none outline-none font-body text-body-md text-on-surface placeholder:text-outline"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label={t("clearAriaLabel")}
              className="text-outline hover:text-on-surface"
            >
              <Icon name="close" size={18} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-outline-variant px-1.5 py-0.5 font-label text-label-sm text-outline">
            Esc
          </kbd>
        </div>

        {/* Nəticələr */}
        <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
          {loading ? (
            <p className="py-space-2xl text-center font-body text-body-sm text-outline">
              {t("loading")}
            </p>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-space-xs py-space-2xl px-space-md text-center">
              <Icon name="search_off" size={32} className="text-outline" />
              <p className="font-headline text-headline-sm text-on-surface">
                {t("noResultsTitle", { query })}
              </p>
              <p className="font-body text-body-sm text-on-surface-variant">
                {t("noResultsHint")}
              </p>
            </div>
          ) : (
            <>
              <p className="px-space-md pt-space-sm font-label text-label-sm uppercase tracking-wider text-outline">
                {q ? t("resultsCount", { count: results.length }) : t("recentArticles")}
              </p>
              <ul ref={listRef} className="p-space-xs">
                {results.map((item, i) => (
                  <li key={item.slug}>
                    <Link
                      href={`/articles/${item.slug}`}
                      onClick={onClose}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex items-start gap-space-sm rounded-lg px-space-sm py-space-sm transition-colors",
                        i === active
                          ? "bg-secondary/[0.09]"
                          : "hover:bg-surface-container-low",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center",
                          i === active
                            ? "bg-secondary text-on-secondary"
                            : "bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        <Icon name="article" size={17} />
                      </span>
                      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="font-headline text-headline-sm text-on-surface leading-snug line-clamp-2">
                          <Highlight text={item.title} query={q} />
                        </span>
                        <span className="flex items-center gap-space-xs font-label text-label-sm text-outline">
                          <span className="text-secondary font-semibold">
                            {item.categoryName}
                          </span>
                        </span>
                      </span>
                      {i === active && (
                        <Icon
                          name="keyboard_return"
                          size={16}
                          className="mt-1 shrink-0 text-outline"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Alt lent */}
        <div className="flex items-center justify-between gap-space-sm px-space-md py-space-xs border-t border-surface-container bg-surface-container-low/60">
          <span className="hidden sm:flex items-center gap-space-sm font-label text-label-sm text-outline">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-outline-variant px-1">↑</kbd>
              <kbd className="rounded border border-outline-variant px-1">↓</kbd>
              {t("navigationHint")}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-outline-variant px-1">↵</kbd>
              {t("openHint")}
            </span>
          </span>
          <button
            type="button"
            onClick={submitAll}
            className="ms-auto inline-flex items-center gap-1 font-label text-label-sm font-semibold text-secondary hover:underline"
          >
            {t("searchAllCta")}
            <Icon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
