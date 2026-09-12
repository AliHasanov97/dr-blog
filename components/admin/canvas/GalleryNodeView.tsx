"use client";

import Image from "next/image";
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { ImagePicker } from "../ImagePicker";
import { coverOptions } from "@/lib/admin/covers";
import { useArticleScope } from "./ArticleMediaContext";
import {
  ASPECT_RATIO_PRESETS,
  GROUP_COLUMN_CLASS,
  resolveGroupColumns,
  resolveGroupItemFrame,
} from "@/lib/article-image";
import type { ImageAspectRatio, ImageFit, SlideItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeightHandle, ResizableMedia } from "./ResizableMedia";
import { useHeightDrag } from "./useHeightDrag";
import { alignOptions } from "./ImageNodeView";
import {
  BlockBar,
  BlockBarButton,
  BlockBarInput,
  BlockBarPanel,
  BlockBarSep,
} from "./BlockBar";

const FIT_OPTIONS: { value: ImageFit; label: string; hint: string }[] = [
  { value: "cover", label: "Doldur", hint: "Xananı tam doldurur, kənarları kəsilə bilər" },
  { value: "contain", label: "Tam göstər", hint: "Şəklin heç yeri kəsilmir" },
];

function readItems(raw: string): SlideItem[] {
  try {
    const parsed = JSON.parse(raw || "[]") as SlideItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Şəkil cərgəsi — bir neçə şəkil eyni sətirdə, yan-yana (qalereya).
 * Slayd blokundan fərqi: hamısı eyni anda görünür, sürüşdürmə yoxdur.
 *
 * Ümumi çərçivə (yerləşmə + en) digər media blokları ilə eyni
 * `ResizableMedia` komponentini işlədir — kənardakı tutacağı sürüşdürərək
 * dəyişdirmə bütün blok növlərində eynidir.
 */
export function GalleryNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  /* Yüklənən fayl məqalənin öz qovluğuna düşsün deyə */
  const scope = useArticleScope("body");
  const items = readItems(node.attrs.items as string);
  const [active, setActive] = useState(0);
  /* Eyni anda yalnız bir panel açıq olur — əks halda üzən panellər
   * üst-üstə düşərdi (bax: BlockBarPanel absolute mövqeləndirilir). */
  const [openPanel, setOpenPanel] = useState<
    "settings" | "caption" | "add" | "replace" | null
  >(null);
  const settings = openPanel === "settings";
  const panel = openPanel === "caption";
  const picker = openPanel === "add" || openPanel === "replace" ? openPanel : null;

  const align = (node.attrs.align as string) || "full";
  const width = Number(node.attrs.width) || 50;

  const columnsAttr = Number(node.attrs.columns) || undefined;
  const columns = resolveGroupColumns(
    columnsAttr as 1 | 2 | 3 | 4 | undefined,
    Math.max(1, items.length),
  );
  const aspectRatio = (node.attrs.aspectRatio as ImageAspectRatio) || undefined;
  const fit = (node.attrs.fit as ImageFit) || undefined;
  const frame = resolveGroupItemFrame({ aspectRatio, fit });

  const activeIndex = Math.min(active, Math.max(0, items.length - 1));
  const current = items[activeIndex];

  /*
   * Hündürlüyü siçanla dartmaq. Nisbət bütün xanalar üçün ortaqdır, ona görə
   * ölçmə üçün istinad (`frameRef`) yalnız seçili xanaya bağlanır, amma
   * dartma zamanı canlı önizləmə (`previewRatio`) BÜTÜN xanalara tətbiq
   * olunur ki, cərgə vahid şəkil kimi sürüşdürülsün.
   */
  const {
    frameRef: heightFrameRef,
    previewRatio: heightPreview,
    dragging: heightDragging,
    startDrag: startHeightDrag,
  } = useHeightDrag<HTMLButtonElement>((ratio) =>
    updateAttributes({ aspectRatio: ratio }),
  );
  const cellStyle =
    heightPreview !== null ? { aspectRatio: heightPreview } : frame.frameStyle;

  function save(next: SlideItem[]) {
    updateAttributes({ items: JSON.stringify(next) });
  }

  function updateItem(index: number, patch: Partial<SlideItem>) {
    save(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <NodeViewWrapper className="my-space-md" data-drag-handle>
      <ResizableMedia
        align={align}
        width={width}
        selected={selected}
        onResize={(value) => updateAttributes({ width: value })}
        onAlignChange={(value) => updateAttributes({ align: value })}
      >
        <div className={cn("grid gap-space-xs", GROUP_COLUMN_CLASS[columns])}>
          {items.length === 0 ? (
            <button
              type="button"
              onClick={() => setOpenPanel("add")}
              className="relative w-full aspect-square rounded-xl overflow-hidden border border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-1 text-outline hover:text-secondary"
            >
              <Icon name="grid_view" size={30} />
              <span className="font-label text-label-md">Şəkil əlavə edin</span>
            </button>
          ) : (
            items.map((item, index) => {
              const isActive = selected && index === activeIndex;
              return (
                <div key={`${item.src}-${index}`} className="relative">
                  <button
                    type="button"
                    ref={index === activeIndex ? heightFrameRef : undefined}
                    onClick={() => setActive(index)}
                    className={cn(
                      "block relative w-full rounded-xl overflow-hidden border-2 bg-surface-container-low transition-colors",
                      isActive ? "border-secondary" : "border-transparent",
                    )}
                    style={cellStyle}
                  >
                    {item.src && (
                      <Image
                        src={item.src}
                        alt={item.alt || ""}
                        fill
                        sizes="360px"
                        className={frame.imageClassName}
                        style={frame.imageStyle}
                      />
                    )}
                  </button>
                  {isActive && (
                    <HeightHandle
                      dragging={heightDragging}
                      onPointerDown={startHeightDrag}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </ResizableMedia>

      {selected && (
        <div className="relative">
          <BlockBar>
            {alignOptions.map((option) => (
              <BlockBarButton
                key={option.value}
                icon={option.icon}
                title={option.label}
                active={align === option.value}
                onClick={() => updateAttributes({ align: option.value })}
              />
            ))}
            {align !== "full" && (
              <span
                title="Cərgənin eni — kənardakı tutacağı sürüşdürərək dəyişin"
                className="px-1.5 font-label text-label-sm text-on-surface-variant tabular-nums"
              >
                {width}%
              </span>
            )}
            <BlockBarSep />
            {[2, 3, 4].map((n) => (
              <BlockBarButton
                key={n}
                text={String(n)}
                title={`${n} sütun`}
                active={columns === n}
                onClick={() => updateAttributes({ columns: n })}
              />
            ))}
            <BlockBarSep />
            <BlockBarButton
              icon="aspect_ratio"
              title="Nisbət və sığma"
              active={settings}
              onClick={() => setOpenPanel((v) => (v === "settings" ? null : "settings"))}
            />
            <BlockBarSep />
            <BlockBarButton
              icon="add_photo_alternate"
              title="Cərgəyə şəkil əlavə et"
              active={picker === "add"}
              onClick={() => setOpenPanel((v) => (v === "add" ? null : "add"))}
            />
            {items.length > 0 && (
              <>
                <BlockBarButton
                  icon="swap_horiz"
                  title="Seçili şəkli dəyiş"
                  active={picker === "replace"}
                  onClick={() =>
                    setOpenPanel((v) => (v === "replace" ? null : "replace"))
                  }
                />
                <BlockBarButton
                  icon="edit_note"
                  title="Seçili şəklin altyazısı və təsviri"
                  active={panel}
                  onClick={() => setOpenPanel((v) => (v === "caption" ? null : "caption"))}
                />
                <BlockBarSep />
                <BlockBarButton
                  icon="close"
                  title="Seçili şəkli cərgədən çıxar"
                  tone="danger"
                  onClick={() => {
                    if (items.length <= 1) return;
                    save(items.filter((_, i) => i !== activeIndex));
                    setActive(Math.max(0, activeIndex - 1));
                  }}
                />
              </>
            )}
            <BlockBarButton
              icon="delete"
              title="Bütün cərgəni sil"
              tone="danger"
              onClick={deleteNode}
            />
          </BlockBar>

          {settings && (
            <BlockBarPanel onClose={() => setOpenPanel(null)}>
              <div className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-on-surface-variant">
                  Xanaların nisbəti
                </span>
                <p className="flex items-start gap-1 font-label text-label-sm text-outline leading-snug">
                  <Icon name="drag_indicator" size={14} className="mt-0.5 shrink-0" />
                  Seçili xananın aşağı kənarındakı tutacağı dartaraq hündürlüyü
                  sərbəst seçin — bütün xanalar birlikdə dəyişir.
                </p>
                <div className="flex flex-wrap gap-1">
                  {ASPECT_RATIO_PRESETS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => updateAttributes({ aspectRatio: option.value })}
                      aria-pressed={frame.aspectRatio === option.value}
                      className={cn(
                        "h-7 px-2 rounded-md font-label text-label-sm transition-colors",
                        frame.aspectRatio === option.value
                          ? "bg-secondary text-on-secondary"
                          : "text-on-surface-variant hover:bg-surface-container",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-on-surface-variant">
                  Şəkillər xanaya necə sığsın
                </span>
                <div className="flex gap-1">
                  {FIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      title={option.hint}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => updateAttributes({ fit: option.value })}
                      aria-pressed={frame.fit === option.value}
                      className={cn(
                        "h-7 px-2 rounded-md font-label text-label-sm transition-colors",
                        frame.fit === option.value
                          ? "bg-secondary text-on-secondary"
                          : "text-on-surface-variant hover:bg-surface-container",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </BlockBarPanel>
          )}

          {panel && current && (
            <BlockBarPanel onClose={() => setOpenPanel(null)}>
              <BlockBarInput
                label={`${activeIndex + 1}-ci şəklin altyazısı`}
                placeholder="Qısa izah"
                value={current.caption ?? ""}
                onChange={(value) => updateItem(activeIndex, { caption: value })}
              />
              <BlockBarInput
                label="Şəkildə nə var?"
                hint="Görmə problemi olan oxucular üçün"
                placeholder="Nəticə cədvəli"
                value={current.alt ?? ""}
                onChange={(value) => updateItem(activeIndex, { alt: value })}
              />
            </BlockBarPanel>
          )}

          {picker && (
            <BlockBarPanel onClose={() => setOpenPanel(null)}>
              <ImagePicker
                scope={scope}
                label={picker === "add" ? "Yeni şəkil" : "Seçili şəklin yenisi"}
                value={picker === "replace" ? (current?.src ?? "") : ""}
                options={coverOptions}
                onChange={(value) => {
                  if (picker === "add") {
                    save([...items, { src: value, alt: "", caption: "" }]);
                    setActive(items.length);
                  } else {
                    updateItem(activeIndex, { src: value });
                  }
                  setOpenPanel(null);
                }}
              />
            </BlockBarPanel>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}
