"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ArticleVideoProps {
  videoId: string;
  caption?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * YouTube videosu.
 * Səhifə ağırlaşmasın deyə əvvəlcə yalnız örtük şəkli göstərilir —
 * oynatma düyməsinə basılanda iframe yüklənir.
 */
export function ArticleVideo({
  videoId,
  caption,
  className,
  style,
}: ArticleVideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure
      style={style}
      className={cn("clear-both flex flex-col gap-space-xs", className)}
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-container bg-primary-container">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Videonu oynat"
            className="group absolute inset-0 w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-on-surface/25 group-hover:bg-on-surface/15 transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-surface/95 text-secondary flex items-center justify-center shadow-level-2 group-hover:scale-105 transition-transform">
                <Icon name="play_arrow" size={34} />
              </span>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="font-label text-label-sm text-outline text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
