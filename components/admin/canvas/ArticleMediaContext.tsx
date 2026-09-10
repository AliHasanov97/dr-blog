"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ArticlePart, MediaScope } from "@/lib/admin/storage/scope";

/**
 * Redaktə olunan məqalənin kimliyi.
 *
 * Kətanın içindəki şəkil və sənəd blokları TipTap tərəfindən render olunur,
 * ona görə propları birbaşa ötürmək mümkün deyil — kontekst işlədilir.
 * Bunun sayəsində hər yüklənən fayl məqalənin öz qovluğuna düşür və
 * seçici pəncərə də yalnız həmin məqalənin fayllarını göstərir.
 */
const ArticleKeyContext = createContext<string | null>(null);

export function ArticleMediaProvider({
  articleKey,
  children,
}: {
  articleKey: string;
  children: ReactNode;
}) {
  return (
    <ArticleKeyContext.Provider value={articleKey}>
      {children}
    </ArticleKeyContext.Provider>
  );
}

/**
 * Cari məqalənin fayl əhatəsi.
 *
 * Kontekst yoxdursa (məqalə redaktorundan kənarda) fayllar sayt üzrə
 * ümumi qovluğa düşür.
 */
export function useArticleScope(part: ArticlePart): MediaScope {
  const articleKey = useContext(ArticleKeyContext);
  return useMemo<MediaScope>(
    () =>
      articleKey
        ? { kind: "article", articleKey, part }
        : { kind: "site" },
    [articleKey, part],
  );
}
