"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import type { SlideItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SliderItemWithCaption extends SlideItem {
  renderedCaption?: React.ReactNode;
}

export interface ArticleSliderProps {
  items: SliderItemWithCaption[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Məqalə içindəki slayd.
 * Sürüşdürmə CSS `scroll-snap` ilə aparılır — JavaScript sönsə belə şəkillər
 * barmaqla sürüşdürülə bilir; düymələr və nöqtələr yalnız əlavə rahatlıqdır.
 */
export function ArticleSlider({
  items,
  className,
  style,
}: ArticleSliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Sürüşdürmə zamanı aktiv slaydı təyin edir */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = track.current;
        if (!node) return;
        const index = Math.round(node.scrollLeft / node.clientWidth);
        setActive(Math.max(0, Math.min(items.length - 1, index)));
      });
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  function goTo(index: number) {
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(items.length - 1, index));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
    setActive(target);
  }

  if (items.length === 0) return null;

  const current = items[active];

  return (
    <div
      style={style}
      className={cn("clear-both flex flex-col gap-space-xs", className)}
    >
      <div className="relative group">
        <div
          ref={track}
          tabIndex={0}
          role="group"
          aria-roledescription="slayd"
          aria-label={`Şəkil qalereyası — ${items.length} slayd`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goTo(active + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-xl border border-surface-container [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:ring-2 focus-visible:ring-secondary/50 outline-none"
        >
          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              aria-label={`${index + 1} / ${items.length}`}
              className="relative shrink-0 w-full aspect-[16/9] snap-center"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <SliderButton
              side="start"
              icon="chevron_left"
              label="Əvvəlki şəkil"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            />
            <SliderButton
              side="end"
              icon="chevron_right"
              label="Növbəti şəkil"
              disabled={active === items.length - 1}
              onClick={() => goTo(active + 1)}
            />
            <span className="absolute top-space-xs end-space-xs rounded-full bg-on-surface/55 text-surface px-2 py-0.5 font-label text-label-sm">
              {active + 1} / {items.length}
            </span>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {items.map((item, index) => (
            <button
              key={`dot-${item.src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${index + 1}-ci şəkil`}
              aria-current={index === active}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === active
                  ? "w-5 bg-secondary"
                  : "w-1.5 bg-outline-variant hover:bg-outline",
              )}
            />
          ))}
        </div>
      )}

      {(current.renderedCaption || current.caption) && (
        <p className="font-label text-label-sm text-outline text-center">
          {current.renderedCaption ?? current.caption}
        </p>
      )}
    </div>
  );
}

function SliderButton({
  side,
  icon,
  label,
  disabled,
  onClick,
}: {
  side: "start" | "end";
  icon: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full",
        "bg-surface/90 text-on-surface shadow-level-2 backdrop-blur-sm",
        "flex items-center justify-center transition-opacity",
        "disabled:opacity-0 disabled:pointer-events-none",
        side === "start" ? "start-space-xs" : "end-space-xs",
      )}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}
