"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { useArticleScope } from "./ArticleMediaContext";
import { FilePicker } from "../FilePicker";
import { cn } from "@/lib/utils";
import {
  BlockBar,
  BlockBarButton,
  BlockBarInput,
  BlockBarPanel,
  BlockBarSep,
} from "./BlockBar";

export function FileNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  /* Yüklənən fayl məqalənin öz qovluğuna düşsün deyə */
  const scope = useArticleScope("file");
  const url = (node.attrs.url as string) || "";
  const title = (node.attrs.title as string) || "";
  const extension = (node.attrs.extension as string) || "PDF";
  const sizeLabel = (node.attrs.size as string) || "";
  const description = (node.attrs.description as string) || "";

  const [picking, setPicking] = useState(!url);
  const [panel, setPanel] = useState(false);

  return (
    <NodeViewWrapper className="my-space-md" data-drag-handle>
      <div className={cn(selected && "ring-2 ring-secondary/60 rounded-xl")}>
        {url ? (
          /* Redaktorda kliklə fayl endirilməsin deyə hadisə saxlanılır */
          <div
            className="block [&_a]:pointer-events-none"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-space-md rounded-xl border-2 border-secondary/30 bg-secondary/[0.06] p-space-md">
              <span className="w-14 h-14 shrink-0 rounded-lg bg-error-container/70 flex flex-col items-center justify-center text-on-error-container">
                <Icon name="picture_as_pdf" size={24} />
                <span className="font-label text-[10px] font-bold mt-0.5">
                  {extension.toUpperCase()}
                </span>
              </span>
              <span className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="font-label text-label-lg text-on-surface leading-snug">
                  {title || "Faylın adını daxil edin"}
                </span>
                {description && (
                  <span className="font-body text-body-sm text-on-surface-variant">
                    {description}
                  </span>
                )}
                <span className="flex items-center gap-space-xs text-secondary">
                  <Icon name="download" size={14} />
                  <span className="font-label text-label-sm">
                    Oxucu bu faylı endirə biləcək
                    {sizeLabel && ` • ${sizeLabel}`}
                  </span>
                </span>
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="w-full flex flex-col items-center justify-center gap-space-sm rounded-xl border-2 border-dashed border-secondary/40 bg-secondary/[0.04] py-space-xl text-secondary hover:bg-secondary/[0.08] hover:border-secondary/60 transition-colors"
          >
            <span className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center">
              <Icon name="upload_file" size={24} />
            </span>
            <span className="flex flex-col items-center gap-0.5">
              <span className="font-label text-label-lg">
                PDF və ya digər fayl əlavə edin
              </span>
              <span className="font-body text-body-sm text-on-surface-variant">
                Oxucular bu faylı endirə biləcək
              </span>
            </span>
          </button>
        )}
      </div>

      {selected && (
        <>
          <BlockBar>
            <BlockBarButton
              icon="upload_file"
              title="Faylı dəyiş və ya yenisini yüklə"
              active={picking}
              onClick={() => setPicking((v) => !v)}
            />
            <BlockBarButton
              icon="edit_note"
              title="Faylın adı və izahı"
              active={panel}
              onClick={() => setPanel((v) => !v)}
            />
            <BlockBarSep />
            <BlockBarButton
              icon="delete"
              title="Faylı məqalədən sil"
              tone="danger"
              onClick={deleteNode}
            />
          </BlockBar>

          {panel && (
            <BlockBarPanel>
              <BlockBarInput
                label="Faylın adı"
                hint="Oxucu bu adı görür"
                placeholder="Hipertoniya protokolu 2024"
                value={title}
                onChange={(value) => updateAttributes({ title: value })}
              />
              <BlockBarInput
                label="Qısa izah (könüllü)"
                placeholder="ESC tövsiyələrinin xülasəsi"
                value={description}
                onChange={(value) => updateAttributes({ description: value })}
              />
            </BlockBarPanel>
          )}

          {picking && (
            <BlockBarPanel>
              <FilePicker
                scope={scope}
                value={url}
                onSelect={(file) => {
                  updateAttributes({
                    url: file.url,
                    title: title || file.title,
                    extension: file.extension,
                    size: file.sizeLabel,
                  });
                  setPicking(false);
                  if (!title) setPanel(true);
                }}
              />
            </BlockBarPanel>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}
