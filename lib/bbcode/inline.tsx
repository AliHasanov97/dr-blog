import type { ReactNode } from "react";
import {
  nodesToText,
  resolveColor,
  resolveFont,
  resolveSize,
  safeHref,
  STRIP_RE,
  tokenizeInline,
  type InlineNode,
} from "./tokenize";

/**
 * Sətiriçi BB kod-un saytdakı render-i.
 *
 * Mətn HTML kimi deyil, React node-ları kimi qurulur — `dangerouslySetInnerHTML`
 * istifadə olunmur, ona görə redaktorun yazdığı mətn XSS riski yaratmır.
 * Naməlum və ya yarımçıq teqlər olduğu kimi (adi mətn kimi) göstərilir.
 */

export interface InlineOptions {
  /** `[term=...]` üçün izahları buradan axtarır */
  glossary?: { term: string; definition: string }[];
}

function lookupTerm(
  key: string,
  glossary: { term: string; definition: string }[] | undefined,
): string | undefined {
  if (!glossary) return undefined;
  const needle = key.trim().toLocaleLowerCase("az");
  return glossary.find(
    (g) => g.term.trim().toLocaleLowerCase("az") === needle,
  )?.definition;
}

function renderNodes(
  nodes: InlineNode[],
  options: InlineOptions,
  prefix: string,
): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${prefix}-${index}`;

    if (node.kind === "text") return node.value;

    if (node.kind === "void") {
      if (node.name === "nl") return <br key={key} />;
      const number = (node.attr ?? "").trim();
      if (!/^\d+$/.test(number)) return `[ref=${number}]`;
      return (
        <sup key={key} className="ms-0.5">
          <a
            href={`#istinad-${number}`}
            title={`${number} nömrəli istinad`}
            className="text-secondary no-underline hover:underline"
          >
            {number}
          </a>
        </sup>
      );
    }

    const children = renderNodes(node.children, options, key);

    switch (node.name) {
      case "b":
        return (
          <strong key={key} className="font-semibold text-on-surface">
            {children}
          </strong>
        );
      case "i":
        return <em key={key}>{children}</em>;
      case "u":
        return (
          <span key={key} className="underline underline-offset-2">
            {children}
          </span>
        );
      case "s":
        return <s key={key}>{children}</s>;
      case "mark":
        return (
          <mark key={key} className="bg-tertiary-fixed/70 text-on-surface rounded px-0.5">
            {children}
          </mark>
        );
      case "color": {
        const color = resolveColor(node.attr);
        if (!color) return <span key={key}>{children}</span>;
        return (
          <span key={key} style={{ color }}>
            {children}
          </span>
        );
      }
      case "size": {
        const fontSize = resolveSize(node.attr);
        if (!fontSize) return <span key={key}>{children}</span>;
        return (
          <span key={key} style={{ fontSize }}>
            {children}
          </span>
        );
      }
      case "font": {
        const fontFamily = resolveFont(node.attr);
        if (!fontFamily) return <span key={key}>{children}</span>;
        return (
          <span key={key} style={{ fontFamily }}>
            {children}
          </span>
        );
      }
      case "url": {
        const href = safeHref(node.attr ?? nodesToText(node.children));
        if (!href) return <span key={key}>{children}</span>;
        const external = /^https?:/i.test(href);
        return (
          <a
            key={key}
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-secondary underline underline-offset-2 decoration-secondary/40 hover:decoration-secondary"
          >
            {children}
          </a>
        );
      }
      case "term": {
        const termKey = (node.attr ?? nodesToText(node.children)).trim();
        const definition = lookupTerm(termKey, options.glossary) || termKey;
        return (
          <abbr
            key={key}
            title={definition}
            className="no-underline border-b border-dotted border-secondary/70 cursor-help"
          >
            {children}
          </abbr>
        );
      }
      default:
        return <span key={key}>{children}</span>;
    }
  });
}

/** BB kodlu mətni JSX-ə çevirir */
export function renderInline(
  source: string,
  options: InlineOptions = {},
): ReactNode {
  if (!source) return null;
  if (!source.includes("[")) return source;
  return renderNodes(tokenizeInline(source), options, "bb");
}

/**
 * Bütün BB kod teqlərini silir — söz sayı, məzmun siyahısı, meta təsvir və
 * axtarış indeksi üçün.
 */
export function stripBBCode(source: string): string {
  if (!source) return "";
  STRIP_RE.lastIndex = 0;
  return source
    .replace(/\[nl\]/gi, " ")
    .replace(STRIP_RE, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}
