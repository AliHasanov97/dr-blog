"use client";

import Image from "next/image";
import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { ImagePicker } from "../ImagePicker";
import { coverOptions } from "@/lib/admin/covers";
import { useArticleScope } from "./ArticleMediaContext";
import type { SlideItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ResizableMedia } from "./ResizableMedia";
import { alignOptions } from "./ImageNodeView";
import {
  BlockBar,
  BlockBarButton,
  BlockBarInput,
  BlockBarPanel,
  BlockBarSep,
} from "./BlockBar";

function readItems(raw: string): SlideItem[] {
  try {
    const parsed = JSON.parse(raw || "[]") as SlideItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function SliderNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  /* Yüklənən fayl məqalənin öz qovluğuna düşsün deyə */
  const scope = useArticleScope("body");
  const items = readItems(node.attrs.items as string);
  const [active, setActive] = useState(0);
  const [picker, setPicker] = useState<"add" | "replace" | null>(null);
  const [panel, setPanel] = useState(false);
  const align = (node.attrs.align as string) || "full";
  const width = Number(node.attrs.width) || 50;

  const current = items[Math.min(active, Math.max(0, items.length - 1))];

  function save(next: SlideItem[]) {
    updateAttributes({ items: JSON.stringify(next) });
  }

  function updateItem(index: number, patch: Partial<SlideItem>) {
    save(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    save(copy);
    setActive(target);
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
        <div className="flex flex-col gap-space-xs">
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-surface-container bg-surface-container-low">
          {current?.src ? (
            <Image
              src={current.src}
              alt={current.alt || ""}
              fill
              sizes="700px"
              className="object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPicker("add")}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-outline hover:text-secondary"
            >
              <Icon name="gallery_thumbnail" size={32} />
              <span className="font-label text-label-md">
                Slayda şəkil əlavə edin
              </span>
            </button>
          )}
          {items.length > 1 && (
            <span className="absolute top-2 end-2 rounded-full bg-on-surface/55 text-surface px-2 py-0.5 font-label text-label-sm">
              {Math.min(active + 1, items.length)} / {items.length}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {items.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                title={`${index + 1}-ci slayd`}
                className={cn(
                  "relative w-14 aspect-[16/10] rounded overflow-hidden border-2 transition-colors",
                  index === active ? "border-secondary" : "border-transparent",
                )}
              >
                {item.src && (
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}

          {current?.caption && (
            <p className="font-label text-label-sm text-outline text-center">
              {current.caption}
            </p>
          )}
        </div>
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
              <span
                title="Slaydın eni — kənardakı tutacağı sürüşdürərək dəyişin"
                className="px-1.5 font-label text-label-sm text-on-surface-variant tabular-nums"
              >
                {width}%
              </span>
            )}
            <BlockBarSep />
            <BlockBarButton
              icon="chevron_left"
              title="Bu slaydı əvvələ daşı"
              onClick={() => move(active, -1)}
            />
            <BlockBarButton
              icon="chevron_right"
              title="Bu slaydı sona daşı"
              onClick={() => move(active, 1)}
            />
            <BlockBarSep />
            <BlockBarButton
              icon="add_photo_alternate"
              title="Yeni slayd əlavə et"
              active={picker === "add"}
              onClick={() => setPicker((v) => (v === "add" ? null : "add"))}
            />
            <BlockBarButton
              icon="swap_horiz"
              title="Bu slaydın şəklini dəyiş"
              active={picker === "replace"}
              onClick={() =>
                setPicker((v) => (v === "replace" ? null : "replace"))
              }
            />
            <BlockBarButton
              icon="edit_note"
              title="Bu slaydın altyazısı və təsviri"
              active={panel}
              onClick={() => setPanel((v) => !v)}
            />
            <BlockBarSep />
            <BlockBarButton
              icon="close"
              title="Bu slaydı sil"
              tone="danger"
              onClick={() => {
                save(items.filter((_, i) => i !== active));
                setActive(Math.max(0, active - 1));
              }}
            />
            <BlockBarButton
              icon="delete"
              title="Bütün slayd blokunu sil"
              tone="danger"
              onClick={deleteNode}
            />
          </BlockBar>

          {panel && items.length > 0 && (
            <BlockBarPanel>
              <BlockBarInput
                label={`${active + 1}-ci slaydın altyazısı`}
                placeholder="Birinci mərhələ"
                value={current?.caption ?? ""}
                onChange={(value) => updateItem(active, { caption: value })}
              />
              <BlockBarInput
                label="Şəkildə nə var?"
                hint="Görmə problemi olan oxucular üçün"
                placeholder="Exo cihazının ekranı"
                value={current?.alt ?? ""}
                onChange={(value) => updateItem(active, { alt: value })}
              />
            </BlockBarPanel>
          )}

          {picker && (
            <BlockBarPanel>
              <ImagePicker
                scope={scope}
                label={
                  picker === "add"
                    ? "Yeni slaydın şəkli"
                    : "Bu slaydın yeni şəkli"
                }
                value={picker === "replace" ? (current?.src ?? "") : ""}
                options={coverOptions}
                onChange={(value) => {
                  if (picker === "add") {
                    save([...items, { src: value, alt: "", caption: "" }]);
                    setActive(items.length);
                  } else {
                    updateItem(active, { src: value });
                  }
                  setPicker(null);
                }}
              />
            </BlockBarPanel>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}
