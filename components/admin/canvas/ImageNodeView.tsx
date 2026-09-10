"use client";

import Image from "next/image";
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { ImagePicker } from "../ImagePicker";
import { coverOptions } from "@/lib/admin/covers";
import { useArticleScope } from "./ArticleMediaContext";
import { cn } from "@/lib/utils";
import { ResizableMedia } from "./ResizableMedia";
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

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  /* Yüklənən fayl məqalənin öz qovluğuna düşsün deyə */
  const scope = useArticleScope("body");
  const [panel, setPanel] = useState(false);
  const [picking, setPicking] = useState(false);

  const src = (node.attrs.src as string) || "";
  const alt = (node.attrs.alt as string) || "";
  const caption = (node.attrs.caption as string) || "";
  const align = (node.attrs.align as string) || "full";
  const width = Number(node.attrs.width) || 50;

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
          <div
            className={cn(
              "relative w-full rounded-xl overflow-hidden border border-surface-container bg-surface-container-low",
              align === "left" || align === "right"
                ? "aspect-[4/3]"
                : "aspect-[16/9]",
            )}
          >
            {src ? (
              <Image
                src={src}
                alt={alt}
                fill
                sizes="700px"
                className="object-cover"
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
