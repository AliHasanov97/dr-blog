import { stripBBCode } from "@/lib/bbcode";
import { slugify } from "@/lib/utils";
import type { ArticleBlock, TableOfContentsItem } from "@/lib/types";

/**
 * Başlıq bloklarına anchor id və nömrə verir.
 *
 * Həm admin yadda saxlayanda, həm də publik səhifə oxuyanda işlədilir —
 * beləliklə məzmun siyahısındakı link (`#id`) ilə səhifədəki başlığın id-si
 * həmişə eyni olur.
 */
export function normalizeHeadings(blocks: ArticleBlock[]): ArticleBlock[] {
  let headingIndex = 0;
  return blocks.map((block) => {
    if (block.type !== "heading") return block;
    headingIndex += 1;
    const plain = stripBBCode(block.text);
    return {
      ...block,
      id: block.id || slugify(plain) || `bolme-${headingIndex}`,
      index: block.index || String(headingIndex).padStart(2, "0"),
    };
  });
}

/**
 * Blok başlıqlarından məzmun siyahısını qurur.
 *
 * Siyahı saxlanılan deyil, hesablanan dəyərdir: mətn dəyişəndə məzmun da
 * özündən dəyişir, köhnəlmiş və ya boş siyahı qalmır.
 */
export function buildToc(blocks: ArticleBlock[]): TableOfContentsItem[] {
  return normalizeHeadings(blocks)
    .filter(
      (b): b is Extract<ArticleBlock, { type: "heading" }> =>
        b.type === "heading",
    )
    .map((b) => ({
      id: b.id,
      index: b.index,
      title: stripBBCode(b.text),
    }));
}
