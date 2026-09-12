import { bbcodeToHtml, htmlToBBCode } from "@/lib/bbcode/html";
import {
  MEDIA_DEFAULT_WIDTH,
  MEDIA_MAX_WIDTH,
  MEDIA_MIN_WIDTH,
  type ArticleBlock,
  type ImageAlign,
  type ImageAspectRatio,
  type ImageFit,
  type ImageFocus,
  type SlideItem,
  type TextAlign,
} from "@/lib/types";
import { formatAspectRatio, parseAspectRatio } from "@/lib/article-image";

/**
 * `ArticleBlock[]` ⇄ redaktorun HTML sənədi.
 *
 * Anbarda saxlanan format dəyişmir — redaktor sadəcə həmin blokları HTML kimi
 * göstərir. Sətiriçi formatlaşdırma (qalın, rəng, ölçü…) BB kod kimi qalır,
 * çevirməni `lib/bbcode/html.ts` aparır.
 *
 * Sadələşdirmələr (həkim üçün seçim sayını azaltmaq məqsədilə):
 *  - «Giriş abzası» ayrıca bölmə deyil — məqalənin BİRİNCİ abzası avtomatik
 *    giriş sayılır.
 *  - Siyahı və slaydın «giriş cümləsi» sahəsi yoxdur — onun yerinə sadəcə
 *    əvvəlinə adi abzas yazılır (saytda nəticə eynidir).
 */

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attr(name: string, value?: string): string {
  const clean = (value ?? "").trim();
  return clean ? ` ${name}="${escapeAttr(clean)}"` : "";
}

/** Stil atributu — align və lineHeight */
function styleAttr(align?: TextAlign, lineHeight?: string): string {
  const parts: string[] = [];
  if (align && align !== "left") parts.push(`text-align: ${align}`);
  if (lineHeight) parts.push(`line-height: ${lineHeight}`);
  return parts.length ? ` style="${parts.join("; ")}"` : "";
}

/* --------------------------------------------------------------
 * Bloklar → redaktor HTML-i
 * ------------------------------------------------------------ */

function blockToHtml(block: ArticleBlock): string {
  switch (block.type) {
    // Giriş abzası redaktorda adi abzas kimi görünür
    case "lead":
    case "paragraph":
      return `<p${styleAttr(block.align, block.lineHeight)}>${bbcodeToHtml(block.text) || ""}</p>`;

    case "heading":
      return `<h2${styleAttr(block.align, block.lineHeight)}>${bbcodeToHtml(block.text)}</h2>`;

    case "quote":
      return `<blockquote${attr("data-label", block.label)}${attr("data-by", block.attribution)}${attr("data-icon", block.icon)}><p>${bbcodeToHtml(block.text)}</p></blockquote>`;

    case "checklist": {
      const intro = block.intro
        ? `<p>${bbcodeToHtml(block.intro)}</p>`
        : "";
      const items = block.items
        .map((item) => {
          const title = bbcodeToHtml(item.title);
          const description = bbcodeToHtml(item.description);
          const body = description ? `${title}<br>${description}` : title;
          return `<li><p>${body}</p></li>`;
        })
        .join("");
      return `${intro}<ul>${items || "<li><p></p></li>"}</ul>`;
    }

    case "bulletList": {
      const items = block.items
        .map((item) => `<li><p>${bbcodeToHtml(item)}</p></li>`)
        .join("");
      return `<ul>${items || "<li><p></p></li>"}</ul>`;
    }

    case "orderedList": {
      const items = block.items
        .map((item) => `<li><p>${bbcodeToHtml(item)}</p></li>`)
        .join("");
      return `<ol>${items || "<li><p></p></li>"}</ol>`;
    }

    case "image":
      return `<div data-block="image"${attr("data-src", block.src)}${attr("data-alt", block.alt)}${attr("data-caption", block.caption)}${attr("data-align", block.align ?? "full")}${attr("data-width", String(block.width ?? MEDIA_DEFAULT_WIDTH))}${attr("data-aspect-ratio", block.aspectRatio)}${attr("data-fit", block.fit)}${attr("data-focus", block.focus)}></div>`;

    case "slider": {
      const intro = block.intro ? `<p>${bbcodeToHtml(block.intro)}</p>` : "";
      return `${intro}<div data-block="slider"${attr("data-items", JSON.stringify(block.items))}${attr("data-align", block.align ?? "full")}${attr("data-width", String(block.width ?? MEDIA_DEFAULT_WIDTH))}></div>`;
    }

    case "imageGroup":
      return `<div data-block="imageGroup"${attr("data-items", JSON.stringify(block.items))}${attr("data-align", block.align ?? "full")}${attr("data-width", String(block.width ?? MEDIA_DEFAULT_WIDTH))}${attr("data-columns", block.columns ? String(block.columns) : undefined)}${attr("data-aspect-ratio", block.aspectRatio)}${attr("data-fit", block.fit)}></div>`;

    case "file":
      return `<div data-block="file"${attr("data-url", block.url)}${attr("data-title", block.title)}${attr("data-extension", block.extension)}${attr("data-size", block.sizeLabel)}${attr("data-description", block.description)}${attr("data-access", block.access)}></div>`;

    case "video":
      return `<div data-block="video"${attr("data-video-id", block.videoId)}${attr("data-caption", block.caption)}${attr("data-align", block.align ?? "full")}${attr("data-width", String(block.width ?? MEDIA_DEFAULT_WIDTH))}></div>`;

    case "table":
      return block.html;

    case "codeBlock":
      return `<pre><code${attr("class", block.language ? `language-${block.language}` : "")}>${escapeAttr(block.code)}</code></pre>`;

    case "horizontalRule":
      return `<hr>`;

    default:
      return "";
  }
}

export function blocksToEditorHtml(blocks: ArticleBlock[]): string {
  const html = blocks.map(blockToHtml).join("");
  return html || "<p></p>";
}

/* --------------------------------------------------------------
 * Redaktor HTML-i → bloklar
 * ------------------------------------------------------------ */

function innerBBCode(element: HTMLElement): string {
  return htmlToBBCode(element);
}

const ALIGNS: ImageAlign[] = ["full", "left", "right", "center"];
const FITS: ImageFit[] = ["cover", "contain"];
const FOCUSES: ImageFocus[] = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

const TEXT_ALIGNS: TextAlign[] = ["left", "center", "right", "justify"];
const FILE_ACCESS: NonNullable<Extract<ArticleBlock, { type: "file" }>["access"]>[] = [
  "download",
  "read",
  "both",
];

/** Elementin `text-align` dəyərini oxuyur; «sola» saxlanmır */
function readTextAlign(el: HTMLElement): TextAlign | undefined {
  const value = el.style.textAlign as TextAlign;
  return value && value !== "left" && TEXT_ALIGNS.includes(value)
    ? value
    : undefined;
}

/** Elementin `line-height` dəyərini oxuyur */
function readLineHeight(el: HTMLElement): string | undefined {
  const value = el.style.lineHeight;
  return value && value !== "normal" ? value : undefined;
}

function readAlign(value: string | undefined): ImageAlign {
  return ALIGNS.includes(value as ImageAlign) ? (value as ImageAlign) : "full";
}

/** `data-width` faizini oxuyur və icazəli aralığa sıxır */
function readWidth(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "");
  if (!Number.isFinite(parsed)) return MEDIA_DEFAULT_WIDTH;
  return Math.min(MEDIA_MAX_WIDTH, Math.max(MEDIA_MIN_WIDTH, Math.round(parsed)));
}

/** Naməlum və ya köhnəlmiş dəyəri kənara atır — sahə boş qalır, resolver default seçir */
function readEnum<T extends string>(list: readonly T[], value: string | undefined): T | undefined {
  return list.includes(value as T) ? (value as T) : undefined;
}

/**
 * `data-aspect-ratio` onluq ədədini oxuyur.
 * Etibarsız və ya kənar aralıqdadırsa `undefined` qaytarır — o halda
 * resolver `align`-a görə köhnə sabit nisbəti seçir.
 */
function readAspectRatio(value: string | undefined): ImageAspectRatio | undefined {
  const n = parseAspectRatio(value);
  return n === undefined ? undefined : formatAspectRatio(n);
}

/** `data-columns` sütun sayını oxuyur, yalnız 1–4 aralığını qəbul edir */
function readColumns(value: string | undefined): 1 | 2 | 3 | 4 | undefined {
  const n = Number.parseInt(value ?? "", 10);
  return n >= 1 && n <= 4 ? (n as 1 | 2 | 3 | 4) : undefined;
}

function readSlides(value: string | undefined): SlideItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
      .map((row) => ({
        src: typeof row.src === "string" ? row.src : "",
        alt: typeof row.alt === "string" ? row.alt : "",
        caption: typeof row.caption === "string" && row.caption ? row.caption : undefined,
      }));
  } catch {
    return [];
  }
}

/** Siyahı bəndini «başlıq / izah» cütünə ayırır (ilk sətir keçidinə görə) */
function splitListItem(item: HTMLElement): { title: string; description: string } {
  const bb = innerBBCode(item);
  const separator = bb.indexOf("[nl]");
  if (separator === -1) return { title: bb.trim(), description: "" };
  return {
    title: bb.slice(0, separator).trim(),
    description: bb.slice(separator + 4).replace(/\[nl\]/g, " ").trim(),
  };
}

function elementToBlock(el: HTMLElement): ArticleBlock | ArticleBlock[] | null {
  const marker = el.dataset.block;

  if (marker === "image") {
    return {
      type: "image",
      src: el.dataset.src ?? "",
      alt: el.dataset.alt ?? "",
      caption: el.dataset.caption || undefined,
      align: readAlign(el.dataset.align),
      width: readWidth(el.dataset.width),
      aspectRatio: readAspectRatio(el.dataset.aspectRatio),
      fit: readEnum(FITS, el.dataset.fit),
      focus: readEnum(FOCUSES, el.dataset.focus),
    };
  }

  if (marker === "slider") {
    return {
      type: "slider",
      items: readSlides(el.dataset.items),
      align: readAlign(el.dataset.align),
      width: readWidth(el.dataset.width),
    };
  }

  if (marker === "imageGroup") {
    return {
      type: "imageGroup",
      items: readSlides(el.dataset.items),
      align: readAlign(el.dataset.align),
      width: readWidth(el.dataset.width),
      columns: readColumns(el.dataset.columns),
      aspectRatio: readAspectRatio(el.dataset.aspectRatio),
      fit: readEnum(FITS, el.dataset.fit),
    };
  }

  if (marker === "file") {
    return {
      type: "file",
      url: el.dataset.url ?? "",
      title: el.dataset.title ?? "",
      extension: el.dataset.extension || undefined,
      sizeLabel: el.dataset.size || undefined,
      description: el.dataset.description || undefined,
      access: readEnum(FILE_ACCESS, el.dataset.access),
    };
  }

  if (marker === "video") {
    return {
      type: "video",
      videoId: el.dataset.videoId ?? "",
      caption: el.dataset.caption || undefined,
      align: readAlign(el.dataset.align),
      width: readWidth(el.dataset.width),
    };
  }

  const tag = el.tagName.toLowerCase();

  if (tag === "h1" || tag === "h2" || tag === "h3") {
    const text = innerBBCode(el);
    return text
      ? { type: "heading", id: "", index: "", text, align: readTextAlign(el), lineHeight: readLineHeight(el) }
      : null;
  }

  if (tag === "blockquote") {
    const paragraphs = Array.from(el.querySelectorAll("p"))
      .map((p) => innerBBCode(p))
      .filter(Boolean);
    const text = paragraphs.join("[nl]");
    if (!text) return null;
    return {
      type: "quote",
      label: el.dataset.label || "Həkimin tövsiyəsi",
      text,
      attribution: el.dataset.by || undefined,
      icon: el.dataset.icon || undefined,
    };
  }

  if (tag === "ul") {
    const items = Array.from(el.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((li) => innerBBCode(li))
      .filter(Boolean);
    return items.length > 0 ? { type: "bulletList", items } : null;
  }

  if (tag === "ol") {
    const items = Array.from(el.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((li) => innerBBCode(li))
      .filter(Boolean);
    return items.length > 0 ? { type: "orderedList", items } : null;
  }

  if (tag === "p" || tag === "div") {
    const text = innerBBCode(el);
    return text ? { type: "paragraph", text, align: readTextAlign(el), lineHeight: readLineHeight(el) } : null;
  }

  if (tag === "table") {
    return { type: "table", html: el.outerHTML };
  }

  if (tag === "pre") {
    const codeEl = el.querySelector("code");
    const code = codeEl?.textContent ?? el.textContent ?? "";
    const langClass = codeEl?.className ?? "";
    const langMatch = langClass.match(/language-(\w+)/);
    return { type: "codeBlock", code, language: langMatch?.[1] };
  }

  if (tag === "hr") {
    return { type: "horizontalRule" };
  }

  return null;
}

/**
 * Redaktorun HTML-ini bloklara çevirir.
 * Birinci abzas avtomatik «giriş abzası» olur — saytda ilk hərf böyük çıxır.
 */
export function editorHtmlToBlocks(html: string): ArticleBlock[] {
  const host = document.createElement("div");
  host.innerHTML = html;

  const blocks: ArticleBlock[] = [];
  for (const child of Array.from(host.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const result = elementToBlock(child);
    if (!result) continue;
    if (Array.isArray(result)) blocks.push(...result);
    else blocks.push(result);
  }

  // Yalnız məqalə birbaşa abzasla başlayırsa — o abzas giriş sayılır
  if (blocks[0]?.type === "paragraph") {
    blocks[0] = { type: "lead", text: blocks[0].text, align: blocks[0].align };
  }

  return blocks;
}
