import type { TimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

/** Təhsil və ixtisaslaşma xronologiyası — yaşıl node-larla */
export function Timeline({ entries, className }: TimelineProps) {
  return (
    <ol className={cn("relative flex flex-col", className)}>
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-space-md pb-space-lg last:pb-0">
          <span className="relative flex flex-col items-center shrink-0 w-4">
            <span className="w-3 h-3 rounded-full bg-secondary ring-4 ring-secondary/15 mt-1.5" />
            {index < entries.length - 1 && (
              <span className="flex-1 w-px bg-outline-variant mt-1" />
            )}
          </span>

          <span className="flex flex-col gap-0.5 min-w-0 pb-space-2xs">
            <span className="font-label text-label-md uppercase tracking-wider text-secondary">
              {entry.period}
            </span>
            <span className="font-headline text-headline-sm text-on-surface leading-snug">
              {entry.institution}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              {entry.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
