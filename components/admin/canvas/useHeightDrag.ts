"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { formatAspectRatio, MAX_ASPECT_RATIO, MIN_ASPECT_RATIO } from "@/lib/article-image";

/** Sürüşdürmə zamanı hündürlük bundan aşağı düşməsin (piksel) */
const MIN_HEIGHT_PX = 48;

/**
 * Şəkil çərçivəsinin hündürlüyünü siçanla dartaraq dəyişmək.
 *
 * En artıq `ResizableMedia`-dakı kənar tutacaqlarla dəyişilə bilir; bu hook
 * eyni hissi verən ikinci ox üçündür — aşağı kənardakı tutacağı dartanda
 * çərçivənin nisbəti (`aspect-ratio`) yenidən hesablanır. En sabit qalır,
 * yalnız hündürlük dəyişir, ona görə nəticə hər zaman `en:hündürlük`
 * nisbəti kimi saxlanılır — piksel deyil, responsiv qalır.
 */
export function useHeightDrag<E extends HTMLElement = HTMLDivElement>(
  onCommit: (ratio: string) => void,
) {
  const frameRef = useRef<E>(null);
  const [previewRatio, setPreviewRatio] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const startY = event.clientY;
    const width = rect.width;
    const startHeight = rect.height;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(true);

    function onMove(move: PointerEvent) {
      const nextHeight = Math.max(MIN_HEIGHT_PX, startHeight + (move.clientY - startY));
      const ratio = width / nextHeight;
      setPreviewRatio(Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, ratio)));
    }

    function onUp() {
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      setDragging(false);
      setPreviewRatio((value) => {
        if (value !== null) onCommit(formatAspectRatio(value));
        return null;
      });
    }

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  return { frameRef, previewRatio, dragging, startDrag };
}
