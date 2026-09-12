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
  /* `onUp`-da son dəyəri oxumaq üçün — bax `ResizableMedia.tsx`-dəki eyni
   * qeyd: funksional yeniləyicinin içində `onCommit` kimi yan-effekt
   * çağırmaq React-in render zamanı state yeniləmə xətasına səbəb olurdu. */
  const previewRef = useRef<number | null>(null);

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
      const clamped = Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, ratio));
      previewRef.current = clamped;
      setPreviewRatio(clamped);
    }

    function onUp() {
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      setDragging(false);
      const value = previewRef.current;
      previewRef.current = null;
      setPreviewRatio(null);
      if (value !== null) onCommit(formatAspectRatio(value));
    }

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  return { frameRef, previewRatio, dragging, startDrag };
}
