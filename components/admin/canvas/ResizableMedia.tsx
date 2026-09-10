"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  MEDIA_DEFAULT_WIDTH,
  MEDIA_MAX_WIDTH,
  MEDIA_MIN_WIDTH,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ResizableMediaProps {
  align: string;
  width?: number;
  selected: boolean;
  /** Yeni en faizi — sürüşdürmə bitəndə deyil, anında verilir */
  onResize: (width: number) => void;
  /** «Tam en» ikən sürüşdürəndə blok avtomatik ortaya keçir */
  onAlignChange: (align: string) => void;
  children: ReactNode;
}

const ALIGN_CLASS: Record<string, string> = {
  full: "w-full clear-both",
  left: "sm:float-start sm:me-4",
  right: "sm:float-end sm:ms-4",
  center: "mx-auto clear-both",
};

/** Rahat dayanacaq nöqtələri — bunlara yaxın olanda en «yapışır» */
const SNAP_POINTS = [25, 33, 50, 67, 75, 100];

function snap(value: number): number {
  const nearest = SNAP_POINTS.find((point) => Math.abs(point - value) <= 3);
  if (nearest) return nearest;
  return Math.round(value / 5) * 5;
}

function clamp(value: number): number {
  return Math.min(MEDIA_MAX_WIDTH, Math.max(MEDIA_MIN_WIDTH, value));
}

/**
 * Media blokunun çərçivəsi: yerləşmə, en və sürüşdürməklə ölçü dəyişimi.
 * Şəkil, slayd və video eyni çərçivədən istifadə edir ki, davranış hər yerdə
 * eyni olsun.
 */
export function ResizableMedia({
  align,
  width,
  selected,
  onResize,
  onAlignChange,
  children,
}: ResizableMediaProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  const percent = clamp(Math.round(width ?? MEDIA_DEFAULT_WIDTH));
  const shown = preview ?? (align === "full" ? 100 : percent);

  function startResize(
    event: ReactPointerEvent<HTMLButtonElement>,
    edge: "start" | "end",
  ) {
    event.preventDefault();
    event.stopPropagation();

    const container = frame.current?.parentElement;
    const available = container?.getBoundingClientRect().width ?? 0;
    if (available === 0) return;

    const startX = event.clientX;
    const startPercent = align === "full" ? 100 : percent;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    setDragging(true);

    function onMove(move: PointerEvent) {
      const delta = move.clientX - startX;
      // Sağ kənardan çəkəndə sağa getmək böyüdür, sol kənardan — əksinə
      const direction = edge === "end" ? 1 : -1;
      const next = clamp(startPercent + (direction * delta * 100) / available);
      setPreview(snap(next));
    }

    function onUp() {
      handle.releasePointerCapture(event.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      setDragging(false);
      setPreview((value) => {
        if (value !== null) {
          if (align === "full" && value < 100) onAlignChange("center");
          onResize(value);
        }
        return null;
      });
    }

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  const style =
    align === "full" && preview === null
      ? undefined
      : ({ "--media-width": `${shown}%` } as CSSProperties);

  return (
    <div
      ref={frame}
      style={style}
      className={cn(
        "relative w-full",
        ALIGN_CLASS[align],
        (align !== "full" || preview !== null) && "sm:w-[var(--media-width)]",
        selected && "ring-2 ring-secondary/60 rounded-xl",
      )}
    >
      {children}

      {selected && (
        <>
          <ResizeHandle side="start" onPointerDown={(e) => startResize(e, "start")} />
          <ResizeHandle side="end" onPointerDown={(e) => startResize(e, "end")} />
          <span
            className={cn(
              "absolute top-2 start-2 rounded-full bg-on-surface/70 text-surface px-2 py-0.5 font-label text-label-sm transition-opacity",
              dragging ? "opacity-100" : "opacity-0",
            )}
          >
            {shown}%
          </span>
        </>
      )}
    </div>
  );
}

function ResizeHandle({
  side,
  onPointerDown,
}: {
  side: "start" | "end";
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      contentEditable={false}
      onPointerDown={onPointerDown}
      onMouseDown={(e) => e.stopPropagation()}
      title="Ölçünü dəyişmək üçün sürüşdürün"
      aria-label="Ölçünü dəyiş"
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10 w-3 h-12 rounded-full",
        "bg-secondary/90 border-2 border-surface shadow-level-2",
        "cursor-ew-resize hover:bg-secondary",
        side === "start" ? "-start-1.5" : "-end-1.5",
      )}
    />
  );
}
