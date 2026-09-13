import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui";
import type { OfficeLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ScheduleTableProps {
  schedule: OfficeLocation["schedule"];
  className?: string;
}

export function ScheduleTable({ schedule, className }: ScheduleTableProps) {
  const t = useTranslations("contact");

  return (
    <div className={cn("flex flex-col gap-space-xs", className)}>
      <span className="flex items-center gap-space-2xs font-label text-label-md uppercase tracking-wider text-outline">
        <Icon name="calendar_today" size={15} />
        {t("scheduleTitle")}
      </span>
      <dl className="flex flex-col divide-y divide-surface-container rounded-lg border border-surface-container overflow-hidden">
        {schedule.map((row) => (
          <div
            key={row.day}
            className="flex items-center justify-between gap-space-sm px-space-sm py-2.5 bg-surface-container-lowest"
          >
            <dt className="font-body text-body-sm text-on-surface-variant">
              {row.day}:
            </dt>
            <dd
              className={cn(
                "font-label text-label-lg",
                row.isClosed ? "text-error" : "text-on-surface",
              )}
            >
              {row.hours}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
