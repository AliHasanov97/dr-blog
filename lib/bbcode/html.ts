import {
  nodesToText,
  resolveColor,
  resolveFont,
  resolveSize,
  safeHref,
  tokenizeInline,
  type InlineNode,
} from "./tokenize";

/**
 * BB kod ⇄ HTML.
 *
 * Yalnız admin panelindəki vizual redaktor üçündür: redaktor mətni formatlanmış
 * görür, anbarda isə yenə BB kod saxlanılır. Saytda göstərmə üçün bu fayl deyil,
 * `renderInline` (React) istifadə olunur — orada HTML ümumiyyətlə qurulmur.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nodesToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "text") return escapeHtml(node.value);

      if (node.kind === "void") {
        if (node.name === "nl") return "<br>";
        const number = (node.attr ?? "").trim();
        if (!/^\d+$/.test(number)) return escapeHtml(`[ref=${number}]`);
        return `<sup data-bb="ref" data-ref="${number}" contenteditable="false">${number}</sup>`;
      }

      const inner = nodesToHtml(node.children);

      switch (node.name) {
        case "b":
          return `<strong>${inner}</strong>`;
        case "i":
          return `<em>${inner}</em>`;
        case "u":
          return `<u>${inner}</u>`;
        case "s":
          return `<s>${inner}</s>`;
        case "mark":
          return `<mark>${inner}</mark>`;
        case "color": {
          const color = resolveColor(node.attr);
          if (!color) return inner;
          return `<span style="color:${color}" data-bb="color" data-value="${escapeHtml(node.attr ?? "")}">${inner}</span>`;
        }
        case "size": {
          const size = resolveSize(node.attr);
          if (!size) return inner;
          return `<span style="font-size:${size}" data-bb="size" data-value="${escapeHtml(node.attr ?? "")}">${inner}</span>`;
        }
        case "font": {
          const font = resolveFont(node.attr);
          if (!font) return inner;
          return `<span style="font-family:${font}" data-bb="font" data-value="${escapeHtml(node.attr ?? "")}">${inner}</span>`;
        }
        case "url": {
          const href = safeHref(node.attr ?? nodesToText(node.children));
          if (!href) return inner;
          return `<a href="${escapeHtml(href)}" data-bb="url">${inner}</a>`;
        }
        case "term": {
          const key = (node.attr ?? nodesToText(node.children)).trim();
          return `<abbr title="${escapeHtml(key)}" data-bb="term" data-value="${escapeHtml(key)}">${inner}</abbr>`;
        }
        default:
          return inner;
      }
    })
    .join("");
}

/** BB kod → redaktorda göstəriləcək HTML */
export function bbcodeToHtml(source: string): string {
  if (!source) return "";
  return nodesToHtml(tokenizeInline(source));
}

/* --------------------------------------------------------------
 * HTML → BB kod
 * ------------------------------------------------------------ */

/** `rgb(1, 2, 3)` və ya `#abc` → `#0102 03` formatına gətirir */
function normalizeColor(value: string): string | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(raw);
  if (rgb) {
    const hex = [rgb[1], rgb[2], rgb[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
    return `#${hex}`;
  }
  if (/^#[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
  return null;
}

const SIZE_FROM_PX: [number, string][] = [
  [15, "sm"],
  [19, "md"],
  [23, "lg"],
  [Number.POSITIVE_INFINITY, "xl"],
];

/** `font-size` dəyərini `sm|md|lg|xl` addımlarına yuvarlaqlaşdırır */
const SIZE_KEYWORDS: Record<string, string> = {
  "xx-small": "sm",
  "x-small": "sm",
  small: "sm",
  smaller: "sm",
  medium: "md",
  large: "lg",
  larger: "lg",
  "x-large": "lg",
  "xx-large": "xl",
  "xxx-large": "xl",
};

function normalizeSize(value: string): string | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (SIZE_KEYWORDS[raw]) return SIZE_KEYWORDS[raw];
  const em = /^([\d.]+)em$/.exec(raw);
  if (em) {
    const n = Number(em[1]);
    if (n <= 0.9) return "sm";
    if (n <= 1.05) return "md";
    if (n <= 1.35) return "lg";
    return "xl";
  }
  const px = /^([\d.]+)px$/.exec(raw);
  if (px) {
    const n = Number(px[1]);
    return SIZE_FROM_PX.find(([limit]) => n < limit)?.[1] ?? "xl";
  }
  // execCommand-ın köhnə `<font size="1..7">` dəyərləri
  const step = /^([1-7])$/.exec(raw);
  if (step) {
    const n = Number(step[1]);
    if (n <= 2) return "sm";
    if (n === 3) return "md";
    if (n <= 5) return "lg";
    return "xl";
  }
  return null;
}

function normalizeFont(value: string): string | null {
  const raw = value.toLowerCase();
  if (raw.includes("mono")) return "mono";
  if (raw.includes("newsreader") || raw.includes("--font-display"))
    return raw.includes("--font-display") ? "display" : "headline";
  if (raw.includes("--font-headline")) return "headline";
  if (raw.includes("jakarta") || raw.includes("--font-body")) return "body";
  return null;
}

/** contenteditable-in yaratdığı sərt boşluq (non-breaking space) */
const NBSP = String.fromCharCode(160);

/** Redaktorun yaratdığı sərt boşluqları adi boşluğa çevirir */
function textToBBCode(value: string): string {
  return value.split(NBSP).join(" ");
}

function wrap(open: string, close: string, inner: string): string {
  return inner ? `${open}${inner}${close}` : "";
}

function nodeToBBCode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return textToBBCode(node.textContent ?? "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "br") return "[nl]";

  const marker = el.dataset.bb;

  if (marker === "ref" || (tag === "sup" && el.dataset.ref)) {
    const number = (el.dataset.ref ?? el.textContent ?? "").trim();
    return /^\d+$/.test(number) ? `[ref=${number}]` : "";
  }

  const inner = childrenToBBCode(el);

  switch (tag) {
    case "strong":
    case "b":
      return wrap("[b]", "[/b]", inner);
    case "em":
    case "i":
      return wrap("[i]", "[/i]", inner);
    case "u":
      return wrap("[u]", "[/u]", inner);
    case "s":
    case "strike":
    case "del":
      return wrap("[s]", "[/s]", inner);
    case "mark":
      return wrap("[mark]", "[/mark]", inner);
    case "a": {
      const href = el.getAttribute("href") ?? "";
      const safe = safeHref(href);
      return safe ? wrap(`[url=${safe}]`, "[/url]", inner) : inner;
    }
    case "abbr": {
      const key = el.dataset.value || el.getAttribute("title") || "";
      return key ? wrap(`[term=${key}]`, "[/term]", inner) : inner;
    }
    case "p":
    case "div":
      // Redaktorda Enter yeni <div>/<p> yaradır — bunu sətir keçidi sayırıq
      return inner ? `${inner}[nl]` : "";
    default:
      break;
  }

  // Stil daşıyan elementlər (span, font) — execCommand-ın nəticəsi də buraya düşür
  let result = inner;

  const fontFace =
    el.style.fontFamily || el.getAttribute("face") || el.dataset.value || "";
  if (tag === "span" || tag === "font") {
    const font = el.dataset.bb === "font" ? el.dataset.value : normalizeFont(fontFace);
    if (font && result) result = `[font=${font}]${result}[/font]`;
  }

  const sizeSource =
    el.dataset.bb === "size"
      ? el.dataset.value
      : el.style.fontSize || el.getAttribute("size") || "";
  const size = el.dataset.bb === "size" ? sizeSource : normalizeSize(sizeSource ?? "");
  if (size && result) result = `[size=${size}]${result}[/size]`;

  const colorSource =
    el.dataset.bb === "color"
      ? el.dataset.value
      : el.style.color || el.getAttribute("color") || "";
  const color =
    el.dataset.bb === "color" ? colorSource : normalizeColor(colorSource ?? "");
  if (color && result) result = `[color=${color}]${result}[/color]`;

  if (el.style.fontWeight === "bold" || Number(el.style.fontWeight) >= 600) {
    result = wrap("[b]", "[/b]", result);
  }
  if (el.style.fontStyle === "italic") result = wrap("[i]", "[/i]", result);
  if (el.style.textDecorationLine?.includes("underline")) {
    result = wrap("[u]", "[/u]", result);
  }
  if (el.style.textDecorationLine?.includes("line-through")) {
    result = wrap("[s]", "[/s]", result);
  }

  return result;
}

function childrenToBBCode(el: Node): string {
  return Array.from(el.childNodes).map(nodeToBBCode).join("");
}

/** Redaktordakı HTML → anbarda saxlanan BB kod */
export function htmlToBBCode(root: HTMLElement): string {
  return childrenToBBCode(root)
    .replace(/(\[nl\])+$/g, "")
    .split(NBSP)
    .join(" ")
    .trim();
}
