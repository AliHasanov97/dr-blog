import { stripBBCode } from "@/lib/bbcode";
import type { ArticleBlock } from "@/lib/types";

/** BB kod teqlərini saymadan söz sayı */
function countWords(text: string): number {
  return stripBBCode(text).split(/\s+/).filter(Boolean).length;
}

/** Doldurulmamış vacib sahələri sadə dildə sadalayır */
export function collectWarnings(input: {
  title: string;
  excerpt: string;
  blocks: ArticleBlock[];
}): string[] {
  const warnings: string[] = [];
  if (!input.title.trim()) warnings.push("Başlıq yazılmayıb");
  if (!input.excerpt.trim())
    warnings.push("Qısa təsvir boşdur — siyahılarda boş görünəcək");
  if (input.blocks.length === 0) warnings.push("Məqalənin mətni boşdur");
  const emptyBlocks = input.blocks.filter((b) => {
    if (b.type === "lead" || b.type === "paragraph" || b.type === "heading")
      return !stripBBCode(b.text);
    if (b.type === "quote") return !stripBBCode(b.text);
    if (b.type === "checklist") return b.items.every((i) => !stripBBCode(i.title));
    if (b.type === "image") return !b.src.trim();
    if (b.type === "slider") return b.items.every((i) => !i.src.trim());
    if (b.type === "imageGroup") return b.items.every((i) => !i.src.trim());
    if (b.type === "video") return !b.videoId.trim();
    if (b.type === "file") return !b.url.trim();
    return false;
  }).length;
  if (emptyBlocks > 0)
    warnings.push(`${emptyBlocks} bölmə boş qalıb`);

  /*
   * Məzmun siyahısı yalnız «Başlıq» bloklarından qurulur. Qalın mətnlə
   * yazılmış abzas saytda başlığa oxşayır, amma məzmuna düşmür — bu, ən
   * çox rast gəlinən çaşqınlıqdır, ona görə ayrıca xəbərdarlıq verilir.
   */
  const headings = input.blocks.filter((b) => b.type === "heading").length;
  const fakeHeadings = input.blocks.filter(
    (b) => b.type === "paragraph" && isPseudoHeading(b.text),
  ).length;

  if (fakeHeadings > 0) {
    warnings.push(
      `${fakeHeadings} abzas qalın mətnlə başlıq kimi yazılıb — məzmun siyahısına düşmək üçün «Başlıq» bölməsi işlədin`,
    );
  } else if (headings === 0 && input.blocks.length >= 4) {
    warnings.push(
      "Məqalədə heç bir başlıq yoxdur — məzmun siyahısı boş qalacaq",
    );
  }

  return warnings;
}

/**
 * Bütövlükdə qalın yazılmış qısa abzas — başlıq əvəzinə işlədilib.
 * Cümlə sonu işarəsi olmayan və ya qısa olan mətnlər nəzərə alınır ki,
 * vurğulanmış adi cümlələr yanlış yerə düşməsin.
 */
function isPseudoHeading(text: string): boolean {
  const trimmed = text.trim();
  if (!/^\[b\][\s\S]*\[\/b\]$/.test(trimmed)) return false;

  const inner = stripBBCode(trimmed).trim();
  if (!inner) return false;

  /* İçəridə başqa qalın blok varsa bu, bütöv qalın abzas deyil */
  if (/\[\/b\]/.test(trimmed.slice(3, -4))) return false;

  return countWords(inner) <= 14;
}
