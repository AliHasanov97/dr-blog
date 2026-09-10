"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";

export interface FloatingPanelProps {
  /** Açılma nöqtəsi — siçanın və ya kursorun ekran koordinatı */
  position: { x: number; y: number };
  title: string;
  width?: number;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Siçan nöqtəsində açılan üzən panel.
 * Ekran kənarına çıxmır: yer çatmayanda yuxarı/sola sürüşür.
 */
export function FloatingPanel({
  position,
  title,
  width = 360,
  onClose,
  children,
}: FloatingPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState({ left: position.x, top: position.y });

  useLayoutEffect(() => {
    const height = panel.current?.offsetHeight ?? 320;
    setPlacement({
      left: Math.max(8, Math.min(position.x, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(position.y, window.innerHeight - height - 8)),
    });
  }, [position.x, position.y, width]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointer(event: MouseEvent) {
      if (!panel.current?.contains(event.target as Node)) onClose();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [onClose]);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={title}
      style={{ left: placement.left, top: placement.top, width }}
      className="fixed z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2"
    >
      <div className="sticky top-0 flex items-center gap-space-xs px-space-sm h-9 border-b border-surface-container bg-surface-container-lowest">
        <span className="font-label text-label-md text-on-surface truncate">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Bağla"
          aria-label="Bağla"
          className="ms-auto w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="p-space-sm">{children}</div>
    </div>
  );
}
