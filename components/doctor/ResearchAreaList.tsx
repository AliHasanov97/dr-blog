import { Card, Icon } from "@/components/ui";
import type { ResearchArea } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ResearchAreaListProps {
  areas: ResearchArea[];
  className?: string;
}

export function ResearchAreaList({ areas, className }: ResearchAreaListProps) {
  return (
    <div className={cn("grid gap-space-sm lg:grid-cols-2", className)}>
      {areas.map((area) => (
        <Card key={area.id} className="flex gap-space-sm items-start">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <Icon name={area.icon} size={20} />
          </span>
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="font-label text-label-lg text-on-surface leading-snug">
              {area.title}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
              {area.description}
            </span>
          </span>
        </Card>
      ))}
    </div>
  );
}
