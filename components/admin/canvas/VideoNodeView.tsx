"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { extractYouTubeId } from "@/lib/youtube";
import { ResizableMedia } from "./ResizableMedia";
import { alignOptions } from "./ImageNodeView";
import {
  BlockBar,
  BlockBarButton,
  BlockBarInput,
  BlockBarPanel,
  BlockBarSep,
} from "./BlockBar";

export function VideoNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const videoId = (node.attrs.videoId as string) || "";
  const caption = (node.attrs.caption as string) || "";
  const align = (node.attrs.align as string) || "full";
  const width = Number(node.attrs.width) || 50;

  const [panel, setPanel] = useState(!videoId);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  function applyLink(value: string) {
    setLink(value);
    if (!value.trim()) {
      setError(null);
      return;
    }
    const id = extractYouTubeId(value);
    if (!id) {
      setError("Bu YouTube linki tanınmadı. Videonun ünvanını tam kopyalayın.");
      return;
    }
    setError(null);
    updateAttributes({ videoId: id });
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
        <figure className="flex flex-col gap-space-xs">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-container bg-primary-container">
            {videoId ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-on-surface/25">
                  <span className="w-12 h-12 rounded-full bg-surface/95 text-secondary flex items-center justify-center shadow-level-2">
                    <Icon name="play_arrow" size={26} />
                  </span>
                </span>
              </>
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-surface/80">
                <Icon name="smart_display" size={30} />
                <span className="font-label text-label-md">
                  YouTube linkini yapışdırın
                </span>
              </span>
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
                  title="Videonun eni — kənardakı tutacağı sürüşdürərək dəyişin"
                  className="px-1.5 font-label text-label-sm text-on-surface-variant tabular-nums"
                >
                  {width}%
                </span>
              </>
            )}
            <BlockBarSep />
            <BlockBarButton
              icon="link"
              title="YouTube linki və altyazı"
              active={panel}
              onClick={() => setPanel((v) => !v)}
            />
            <BlockBarButton
              icon="delete"
              title="Videonu sil"
              tone="danger"
              onClick={deleteNode}
            />
          </BlockBar>

          {panel && (
            <BlockBarPanel>
              <BlockBarInput
                label="YouTube linki"
                hint={videoId ? `Hazırkı video: ${videoId}` : undefined}
                placeholder="https://www.youtube.com/watch?v=..."
                value={link}
                onChange={applyLink}
              />
              {error && (
                <span className="flex items-center gap-1 font-label text-label-sm text-error">
                  <Icon name="error" size={14} />
                  {error}
                </span>
              )}
              <BlockBarInput
                label="Altyazı (könüllü)"
                placeholder="CardioTalk — 12-ci buraxılış"
                value={caption}
                onChange={(value) => updateAttributes({ caption: value })}
              />
            </BlockBarPanel>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}
