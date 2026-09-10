import type { DoctorStat } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface StatsGridProps {
  stats: DoctorStat[];
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-space-sm", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center text-center gap-0.5 rounded-xl border border-surface-container bg-surface-container-lowest p-space-md shadow-level-1"
        >
          <span className="font-headline text-headline-md text-primary-container">
            {stat.value}
          </span>
          <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
