"use client";

import Image from "next/image";
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { ImagePicker } from "../ImagePicker";
import { coverOptions } from "@/lib/admin/covers";
import { useArticleScope } from "./ArticleMediaContext";
import { ASPECT_RATIO_PRESETS, resolveImageFrame } from "@/lib/article-image";
import type { ImageAspectRatio, ImageFit, ImageFocus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HeightHandle, ResizableMedia } from "./ResizableMedia";
import { useHeightDrag } from "./useHeightDrag";
import {
  BlockBar,
  BlockBarButton,
  BlockBarInput,
  BlockBarPanel,
  BlockBarSep,
} from "./BlockBar";

/** Şəklin mətnə görə yerləşməsi — ikonlar saytdakı nəticəni göstərir */
export const alignOptions = [
  { value: "full", label: "Tam en", icon: "crop_16_9" },
  { value: "left", label: "Solda — mətn yanından axır", icon: "format_image_left" },
  { value: "right", label: "Sağda — mətn yanından axır", icon: "format_image_right" },
  { value: "center", label: "Ortada", icon: "format_align_center" },
];

const FIT_OPTIONS: { value: ImageFit; label: string; hint: string }[] = [
  { value: "cover", label: "Doldur", hint: "Çərçivəni tam doldurur, kənarları kəsilə bilər" },
  { value: "contain", label: "Tam göstər", hint: "Şəklin heç yeri kəsilmir, lazım gələrsə boşluq qalır" },
];

/** Fokus tor düymələrinin 3×3 sırası */
const FOCUS_GRID: { value: ImageFocus; label: string }[] = [
  { value: "top-left", label: "Yuxarı-sol" },
  { value: "top", label: "Yuxarı" },
  { value: "top-right", label: "Yuxarı-sağ" },
  { value: "left", label: "Sol" },
  { value: "center", label: "Mərkəz" },
  { value: "right", label: "Sağ" },
  { value: "bottom-left", label: "Aşağı-sol" },
  { value: "bottom", label: "Aşağı" },
  { value: "bottom-right", label: "Aşağı-sağ" },
];

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  /* Yüklənən fayl məqalənin öz qovluğuna düşsün deyə */
  const scope = useArticleScope("body");
  const [panel, setPanel] = useState(false);
  const [settings, setSettings] = useState(false);
  const [picking, setPicking] = useState(false);

  const src = (node.attrs.src as string) || "";
  const alt = (node.attrs.alt as string) || "";
  const caption = (node.attrs.caption as string) || "";
  const align = (node.attrs.align as string) || "full";
  const width = Number(node.attrs.width) || 50;

  /* TipTap-da təyin edilməyən sahə `null` gəlir — resolver `undefined` gözləyir */
  const frame = resolveImageFrame({
    align,
    aspectRatio: (node.attrs.aspectRatio as ImageAspectRatio) || undefined,
    fit: (node.attrs.fit as ImageFit) || undefined,
    focus: (node.attrs.focus as ImageFocus) || undefined,
  });

  /* Hündürlüyü siçanla dartmaq — en `ResizableMedia`-dakı kənar
   * tutacaqlarla, hündürlük bu tutacaqla dəyişir. */
  const {
    frameRef: heightFrameRef,
    previewRatio: heightPreview,
    dragging: heightDragging,
    startDrag: startHeightDrag,
  } = useHeightDrag((ratio) => updateAttributes({ aspectRatio: ratio }));
  const frameStyle =
    heightPreview !== null ? { aspectRatio: heightPreview } : frame.frameStyle;

  return (
    <NodeViewWrapper className="my-space-md" data-drag-handle>
      <ResizableMedia
        align={align}
        width={width}
        selected={selected}
        onResize={(value) => updateAttributes({ width: value })}
        onAlignChange={(value) => updateAttributes({ align: value })}
      >
        <figure className="flex flex-col gap-space-xs">
          <div className="relative">
            <div
              ref={heightFrameRef}
              className="relative w-full rounded-xl overflow-hidden border border-surface-container bg-surface-container-low"
              style={frameStyle}
            >
              {src ? (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="700px"
                  className={frame.imageClassName}
                  style={frame.imageStyle}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-outline hover:text-secondary"
                >
                  <Icon name="add_photo_alternate" size={30} />
                  <span className="font-label text-label-md">Şəkil seçin</span>
                </button>
              )}
            </div>
            {selected && (
              <HeightHandle dragging={heightDragging} onPointerDown={startHeightDrag} />
            )}
          </div>
          {caption && (
            <figcaption className="font-label text-label-sm text-outline text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      </ResizableMedia>

      {selected && (
        <>
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
              <>
                <BlockBarSep />
                <span
                  title="Şəklin eni — kənardakı tutacağı sürüşdürərək dəyişin"
                  className="px-1.5 font-label text-label-sm text-on-surface-variant tabular-nums"
                >
                  {width}%
                </span>
              </>
            )}
            <BlockBarSep />
            <BlockBarButton
              icon="aspect_ratio"
              title="Ölçü, sığma və fokus"
              active={settings}
              onClick={() => setSettings((v) => !v)}
            />
            <BlockBarButton
              icon="edit_note"
              title="Altyazı və təsvir"
              active={panel}
              onClick={() => setPanel((v) => !v)}
            />
            <BlockBarButton
              icon="swap_horiz"
              title="Şəkli dəyiş və ya yenisini yüklə"
              active={picking}
              onClick={() => setPicking((v) => !v)}
            />
            <BlockBarButton
              icon="delete"
              title="Şəkli sil"
              tone="danger"
              onClick={deleteNode}
            />
          </BlockBar>

          {settings && (
            <BlockBarPanel>
              <div className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-on-surface-variant">
                  Çərçivənin nisbəti
                </span>
                <p className="flex items-start gap-1 font-label text-label-sm text-outline leading-snug">
                  <Icon name="drag_indicator" size={14} className="mt-0.5 shrink-0" />
                  Şəklin aşağı kənarındakı tutacağı dartaraq hündürlüyü sərbəst
                  seçə bilərsiniz — bu düymələr yalnız tez-tez işlənən ölçülərdir.
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
                  Şəkil çərçivəyə necə sığsın
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

              <div className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-on-surface-variant">
                  Fokus nöqtəsi
                </span>
                <div className="grid grid-cols-3 gap-1 w-fit">
                  {FOCUS_GRID.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      title={option.label}
                      aria-label={option.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => updateAttributes({ focus: option.value })}
                      aria-pressed={frame.focus === option.value}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
                        frame.focus === option.value
                          ? "bg-secondary text-on-secondary"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                      )}
                    >
                      <Icon
                        name={
                          frame.focus === option.value
                            ? "radio_button_checked"
                            : "radio_button_unchecked"
                        }
                        size={13}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </BlockBarPanel>
          )}

          {panel && (
            <BlockBarPanel>
              <BlockBarInput
                label="Altyazı"
                placeholder="Şəklin altında yazılacaq mətn"
                value={caption}
                onChange={(value) => updateAttributes({ caption: value })}
              />
              <BlockBarInput
                label="Şəkildə nə var?"
                hint="Görmə problemi olan oxucular üçün — istəsəniz boş qoyun"
                placeholder="Parkda gəzinti"
                value={alt}
                onChange={(value) => updateAttributes({ alt: value })}
              />
            </BlockBarPanel>
          )}

          {picking && (
            <BlockBarPanel>
              <ImagePicker
                scope={scope}
                label="Hansı şəkil?"
                value={src}
                options={coverOptions}
                onChange={(value) => {
                  updateAttributes({ src: value });
                  setPicking(false);
                }}
              />
            </BlockBarPanel>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}
