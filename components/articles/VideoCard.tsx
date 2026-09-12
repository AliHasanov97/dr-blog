import Image from "next/image";
import Link from "next/link";
import { Badge, Card, Icon } from "@/components/ui";
import type { VideoItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface VideoCardProps {
  video: VideoItem;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  return (
    <Card padded={false} interactive className={cn("overflow-hidden", className)}>
      <Link href={`/videolar/${video.id}`} className="flex flex-col h-full">
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 1024px) 380px, 80vw"
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-surface-container-lowest/90 flex items-center justify-center shadow-level-2">
              <Icon name="play_arrow" size={26} className="text-secondary" filled />
            </span>
          </span>
        </div>
        <div className="p-space-md flex flex-col gap-space-2xs">
          <Badge tone="secondary">{video.kindLabel}</Badge>
          <h4 className="font-headline text-headline-sm text-on-surface leading-snug">
            {video.title}
          </h4>
          <p className="font-body text-body-sm text-on-surface-variant line-clamp-2">
            {video.description}
          </p>
        </div>
      </Link>
    </Card>
  );
}
