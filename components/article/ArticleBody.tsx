import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { ArticleSlider } from "./ArticleSlider";
import { ArticleVideo } from "./ArticleVideo";
import { ArticleFile } from "./ArticleFile";
import { renderInline, type InlineOptions } from "@/lib/bbcode";
import type { ArticleBlock } from "@/lib/types";
import {
  GROUP_COLUMN_CLASS,
  resolveGroupColumns,
  resolveGroupItemFrame,
  resolveImageFrame,
} from "@/lib/article-image";
import { cn } from "@/lib/utils";

export interface ArticleBodyProps {
  blocks: ArticleBlock[];
  className?: string;
}

/**
 * Struktur bloklardan məqalə gövdəsini qurur.
 * Blokların mətn sahələri sətiriçi BB kod saxlaya bilər (`[b]`, `[url]`,
 * `[ref=1]`, `[term=...]`) — onları `renderInline` JSX-ə çevirir.
 * Backend eyni blok formatını qaytarsa, heç nə dəyişməyəcək.
 */
export function ArticleBody({ blocks, className }: ArticleBodyProps) {
  const inline: InlineOptions = {};
  return (
    /*
     * Flex deyil, adi blok axını: yalnız belə olanda mətnin içinə salınmış
     * (`float`) şəkillərin yanından mətn axa bilir. `flow-root` isə float-ların
     * gövdədən kənara — istinadlar panelinə — daşmasının qarşısını alır.
     */
    <div
      className={cn(
        "article-prose flow-root [&>*+*]:mt-space-lg",
        className,
      )}
    >
      {blocks.map((block, index) => (
        <ArticleBlockRenderer key={index} block={block} inline={inline} />
      ))}
    </div>
  );
}

const TEXT_ALIGN: Record<string, string> = {
  left: "",
  center: "text-center",
  right: "text-end",
  justify: "text-justify",
};

/* Media blokunun mətnə görə yerləşməsi */
const MEDIA_ALIGN: Record<string, string> = {
  full: "w-full clear-both",
  left: "sm:float-start sm:me-space-md sm:mb-space-sm",
  right: "sm:float-end sm:ms-space-md sm:mb-space-sm",
  center: "mx-auto clear-both",
};

/**
 * Media blokunun en üslubu.
 * En faiz kimi saxlanılır; mobil ekranda həmişə tam en olur, `sm`-dən sonra
 * CSS dəyişəni ilə tətbiq edilir.
 */
function mediaFrame(align: string, width?: number) {
  const percent = Math.min(100, Math.max(20, Math.round(width ?? 50)));
  return {
    className: cn(
      "w-full",
      MEDIA_ALIGN[align],
      align !== "full" && "sm:w-[var(--media-width)]",
    ),
    style:
      align !== "full"
        ? ({ "--media-width": `${percent}%` } as CSSProperties)
        : undefined,
  };
}

function ArticleBlockRenderer({
  block,
  inline,
}: {
  block: ArticleBlock;
  inline: InlineOptions;
}) {
  switch (block.type) {
    case "lead":
      return (
        <p
          className={cn(
            "font-body text-on-surface leading-relaxed first-letter:font-display first-letter:text-[42px] first-letter:leading-[38px] first-letter:float-start first-letter:me-2 first-letter:mt-1 first-letter:text-primary",
            TEXT_ALIGN[block.align ?? "left"],
          )}
          style={block.lineHeight ? { lineHeight: block.lineHeight } : undefined}
        >
          {renderInline(block.text, inline)}
        </p>
      );

    case "heading":
      return (
        <h2
          id={block.id}
          /* clear-both — yeni bölmə həmişə şəkilin altından təmiz başlayır */
          className={cn(
            "clear-both scroll-mt-28 font-headline text-headline-md text-on-surface leading-snug pt-space-xs",
            TEXT_ALIGN[block.align ?? "left"],
          )}
          style={block.lineHeight ? { lineHeight: block.lineHeight } : undefined}
        >
          {block.index && (
            <span className="text-tertiary-fixed-dim me-1">{block.index}.</span>
          )}
          {renderInline(block.text, inline)}
        </h2>
      );

    case "paragraph":
      return (
        <p
          className={cn(
            "font-body text-on-surface-variant leading-relaxed",
            TEXT_ALIGN[block.align ?? "left"],
          )}
          style={block.lineHeight ? { lineHeight: block.lineHeight } : undefined}
        >
          {renderInline(block.text, inline)}
        </p>
      );

    case "quote":
      return (
        <blockquote className="relative rounded-xl border-s-4 border-secondary bg-secondary/[0.07] p-space-md flex flex-col gap-space-xs">
          <span className="flex items-center gap-space-2xs font-label text-label-md uppercase tracking-wider text-secondary">
            <Icon name={block.icon ?? "format_quote"} size={16} />
            {block.label}
          </span>
          <p className="font-display italic text-headline-sm text-on-surface leading-relaxed">
            «{renderInline(block.text, inline)}»
          </p>
          {block.attribution && (
            <cite className="not-italic font-label text-label-sm text-on-surface-variant">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "checklist":
      return (
        <div className="flex flex-col gap-space-sm">
          {block.intro && (
            <p className="font-body text-on-surface-variant leading-relaxed">
              {renderInline(block.intro, inline)}
            </p>
          )}
          <ul className="flex flex-col gap-space-xs">
            {block.items.map((item, index) => (
              <li
                key={index}
                className="flex gap-space-sm rounded-lg border border-surface-container bg-surface-container-lowest p-space-sm"
              >
                <Icon
                  name="task_alt"
                  size={20}
                  className="text-secondary mt-0.5 shrink-0"
                />
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-label text-label-lg text-on-surface">
                    {renderInline(item.title, inline)}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                    {renderInline(item.description, inline)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "bulletList":
      return (
        <ul className="list-disc list-inside space-y-1 font-body text-on-surface-variant leading-relaxed ps-space-sm">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item, inline)}</li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal list-inside space-y-1 font-body text-on-surface-variant leading-relaxed ps-space-sm">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item, inline)}</li>
          ))}
        </ol>
      );

    case "slider": {
      const frame = mediaFrame(block.align ?? "full", block.width);
      // Pre-render captions on server to avoid passing functions to client
      const itemsWithRenderedCaptions = block.items.map((item) => ({
        ...item,
        renderedCaption: item.caption ? renderInline(item.caption, inline) : undefined,
      }));
      return (
        <div className="flex flex-col gap-space-sm">
          {block.intro && (
            <p className="font-body text-on-surface-variant leading-relaxed">
              {renderInline(block.intro, inline)}
            </p>
          )}
          <ArticleSlider
            items={itemsWithRenderedCaptions}
            className={frame.className}
            style={frame.style}
          />
        </div>
      );
    }

    case "imageGroup": {
      const align = block.align ?? "full";
      const frame = mediaFrame(align, block.width);
      const columns = resolveGroupColumns(block.columns, block.items.length);
      const cell = resolveGroupItemFrame(block);
      return (
        <div
          className={cn("grid gap-space-xs", GROUP_COLUMN_CLASS[columns], frame.className)}
          style={frame.style}
        >
          {block.items.map((item, index) => (
            <figure key={`${item.src}-${index}`} className="flex flex-col gap-space-2xs">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-surface-container bg-surface-container-low"
                style={cell.frameStyle}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 320px, 45vw"
                  className={cell.imageClassName}
                  style={cell.imageStyle}
                />
              </div>
              {item.caption && (
                <figcaption className="font-label text-label-sm text-outline text-center">
                  {renderInline(item.caption, inline)}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case "video": {
      const frame = mediaFrame(block.align ?? "full", block.width);
      return (
        <ArticleVideo
          videoId={block.videoId}
          caption={
            block.caption ? renderInline(block.caption, inline) : undefined
          }
          className={frame.className}
          style={frame.style}
        />
      );
    }

    case "file":
      return (
        <ArticleFile
          url={block.url}
          title={block.title}
          extension={block.extension}
          sizeLabel={block.sizeLabel}
          description={
            block.description ? renderInline(block.description, inline) : undefined
          }
          access={block.access}
        />
      );

    case "image": {
      const align = block.align ?? "full";
      const frame = mediaFrame(align, block.width);
      const image = resolveImageFrame(block);
      return (
        <figure
          className={cn("flex flex-col gap-space-xs", frame.className)}
          style={frame.style}
        >
          <div
            className="relative w-full rounded-xl overflow-hidden border border-surface-container bg-surface-container-low"
            style={image.frameStyle}
          >
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes={
                align === "full"
                  ? "(min-width: 1440px) 1020px, (min-width: 1024px) 640px, 100vw"
                  : "(min-width: 1440px) 510px, (min-width: 1024px) 320px, 100vw"
              }
              className={image.imageClassName}
              style={image.imageStyle}
            />
          </div>
          {block.caption && (
            <figcaption className="font-label text-label-sm text-outline text-center">
              {renderInline(block.caption, inline)}
            </figcaption>
          )}
        </figure>
      );
    }

    case "table":
      return (
        <div
          className="article-table-wrapper overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );

    case "codeBlock":
      return (
        <pre className="rounded-lg bg-surface-container p-space-md overflow-x-auto">
          <code className="font-mono text-body-sm text-on-surface">
            {block.code}
          </code>
        </pre>
      );

    case "horizontalRule":
      return (
        <hr className="border-t-2 border-outline-variant my-space-lg" />
      );

    default:
      return null;
  }
}
