/**
 * Sətiriçi BB kod-un tokenizatoru — həm saytdakı React render-i, həm də
 * admin panelindəki vizual redaktor (HTML çevirməsi) eyni ağacdan istifadə edir.
 * Heç vaxt xəta atmır: yarımçıq və ya naməlum teq adi mətn kimi qalır.
 */

/** Bağlanış tələb edən teqlər */
export const PAIRED_INLINE_TAGS = [
  "b",
  "i",
  "u",
  "s",
  "mark",
  "url",
  "term",
  "color",
  "size",
  "font",
] as const;

/** Tək başına duran teqlər */
export const VOID_INLINE_TAGS = ["ref", "nl"] as const;

export type PairedInlineTag = (typeof PAIRED_INLINE_TAGS)[number];
export type VoidInlineTag = (typeof VOID_INLINE_TAGS)[number];
export type InlineTag = PairedInlineTag | VoidInlineTag;

export const INLINE_TAGS: readonly InlineTag[] = [
  ...PAIRED_INLINE_TAGS,
  ...VOID_INLINE_TAGS,
];

const TAG_PATTERN = INLINE_TAGS.join("|");
const TAG_RE = new RegExp(
  `\\[(\\/?)(${TAG_PATTERN})(?:=([^\\]\\n]*))?\\]`,
  "gi",
);

/** Bütün sətiriçi teqləri tutan şablon — `stripBBCode` üçün */
export const STRIP_RE = new RegExp(
  `\\[\\/?(${TAG_PATTERN})(?:=[^\\]\\n]*)?\\]`,
  "gi",
);

export type InlineNode =
  | { kind: "text"; value: string }
  | { kind: "tag"; name: PairedInlineTag; attr?: string; children: InlineNode[] }
  | { kind: "void"; name: VoidInlineTag; attr?: string };

interface Frame {
  name: PairedInlineTag;
  attr?: string;
  raw: string;
  children: InlineNode[];
}

const VOID_SET = new Set<string>(VOID_INLINE_TAGS);

function appendText(target: InlineNode[], value: string) {
  if (!value) return;
  const last = target[target.length - 1];
  if (last && last.kind === "text") last.value += value;
  else target.push({ kind: "text", value });
}

export function tokenizeInline(source: string): InlineNode[] {
  const root: InlineNode[] = [];
  const stack: Frame[] = [];
  const current = () =>
    stack.length > 0 ? stack[stack.length - 1].children : root;

  let cursor = 0;
  let match: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;

  while ((match = TAG_RE.exec(source)) !== null) {
    appendText(current(), source.slice(cursor, match.index));
    cursor = TAG_RE.lastIndex;

    const raw = match[0];
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();
    const attr = match[3];

    if (VOID_SET.has(name)) {
      if (closing) appendText(current(), raw);
      else current().push({ kind: "void", name: name as VoidInlineTag, attr });
      continue;
    }

    if (!closing) {
      stack.push({ name: name as PairedInlineTag, attr, raw, children: [] });
      continue;
    }

    const top = stack[stack.length - 1];
    if (!top || top.name !== name) {
      // Uyğun açılış yoxdur — teqi adi mətn kimi saxlayırıq
      appendText(current(), raw);
      continue;
    }
    stack.pop();
    current().push({
      kind: "tag",
      name: top.name,
      attr: top.attr,
      children: top.children,
    });
  }

  appendText(current(), source.slice(cursor));

  // Bağlanmamış teqlər: açılış işarəsi mətn kimi qalır, məzmun itmir
  while (stack.length > 0) {
    const frame = stack.pop()!;
    const target = stack.length > 0 ? stack[stack.length - 1].children : root;
    appendText(target, frame.raw);
    for (const child of frame.children) {
      if (child.kind === "text") appendText(target, child.value);
      else target.push(child);
    }
  }

  return root;
}

/** Ağacdan yalnız mətni çıxarır */
export function nodesToText(nodes: InlineNode[]): string {
  return nodes
    .map((n) =>
      n.kind === "text"
        ? n.value
        : n.kind === "tag"
          ? nodesToText(n.children)
          : "",
    )
    .join("");
}

/* --------------------------------------------------------------
 * Dəyər yoxlamaları — redaktorun yaza biləcəyi variantlar məhduddur ki,
 * saytın dizaynı pozulmasın.
 * ------------------------------------------------------------ */

/** Mövzu rənglərinin adları — hex əvəzinə bunları yazmaq tövsiyə olunur */
export const COLOR_TOKENS: Record<string, string> = {
  secondary: "var(--color-secondary)",
  primary: "var(--color-primary-container)",
  error: "var(--color-error)",
  tertiary: "var(--color-tertiary-container)",
  muted: "var(--color-on-surface-variant)",
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `[color=...]` dəyərini təhlükəsiz CSS rənginə çevirir */
export function resolveColor(value?: string): string | null {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (COLOR_TOKENS[raw]) return COLOR_TOKENS[raw];
  if (HEX_RE.test(raw)) return raw;
  return null;
}

export const SIZE_SCALE: Record<string, string> = {
  sm: "0.875em",
  md: "1em",
  lg: "1.25em",
  xl: "1.5em",
};

export function resolveSize(value?: string): string | null {
  const raw = (value ?? "").trim().toLowerCase();
  return SIZE_SCALE[raw] ?? null;
}

export const FONT_STACK: Record<string, string> = {
  headline: "var(--font-headline)",
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

export function resolveFont(value?: string): string | null {
  const raw = (value ?? "").trim().toLowerCase();
  return FONT_STACK[raw] ?? null;
}

const SAFE_PROTOCOL = /^(https?:|mailto:|tel:)/i;

/** Yalnız təhlükəsiz ünvanlara icazə verir (`javascript:` bloklanır) */
export function safeHref(value: string): string | null {
  const href = value.trim();
  if (!href) return null;
  if (href.startsWith("/") || href.startsWith("#")) return href;
  if (SAFE_PROTOCOL.test(href)) return href;
  // Protokolsuz domen: www.example.com → https://www.example.com
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(href)) return `https://${href}`;
  return null;
}
