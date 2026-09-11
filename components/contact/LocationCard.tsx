import { ButtonLink, Card, Icon } from "@/components/ui";
import { ScheduleTable } from "./ScheduleTable";
import type { OfficeLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface LocationCardProps {
  office: OfficeLocation;
  className?: string;
}

/**
 * Google Maps-in API açarı tələb etməyən embed formatı — ünvan mətnindən
 * qurulur, ona görə admin panelində ünvan dəyişəndə xəritə də özü yenilənir.
 */
function buildMapEmbedSrc(office: OfficeLocation): string {
  const query = encodeURIComponent(`${office.name}, ${office.addressLine}`);
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}

export function LocationCard({ office, className }: LocationCardProps) {
  return (
    <Card padded={false} className={cn("overflow-hidden", className)}>
      <div className="relative w-full h-44 lg:h-56">
        <iframe
          src={buildMapEmbedSrc(office)}
          title={`${office.name} xəritədə`}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <span className="absolute bottom-space-sm left-space-sm inline-flex items-center gap-1 px-space-sm py-1.5 rounded-full bg-surface-bright/95 backdrop-blur-md font-label text-label-sm text-on-surface shadow-level-1 pointer-events-none">
          <Icon name="pin_drop" size={15} className="text-secondary" />
          {office.shortAddress}
        </span>
      </div>

      <div className="p-card-padding flex flex-col gap-space-sm">
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-label-md uppercase tracking-wider text-outline">
            Rəsmi Lokasiya
          </span>
          <span className="font-headline text-headline-sm text-on-surface">
            {office.name} — {office.department}
          </span>
          <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
            {office.addressLine}
          </span>
          <span className="flex items-center gap-1 pt-space-2xs font-label text-label-sm text-secondary">
            <Icon name="meeting_room" size={14} />
            {office.room}
          </span>
        </div>

        <ScheduleTable schedule={office.schedule} />

        <ButtonLink
          href={office.mapUrl}
          external
          icon="near_me"
          variant="secondary"
          fullWidth
        >
          Xəritədə Aç / Naviqasiya
        </ButtonLink>
      </div>
    </Card>
  );
}
