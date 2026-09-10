import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { DoctorProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DoctorHeroCardProps {
  doctor: DoctorProfile;
  className?: string;
}

/** Ana səhifənin yuxarısındakı kompakt həkim kartı */
export function DoctorHeroCard({ doctor, className }: DoctorHeroCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary-container text-on-primary shadow-level-2",
        "p-space-md lg:p-space-xl",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-12 -top-12 w-40 h-40 lg:w-64 lg:h-64 rounded-full bg-secondary/15 blur-2xl pointer-events-none"
      />

      <div className="relative flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm lg:gap-space-lg min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full overflow-hidden shadow-md ring-2 ring-tertiary-fixed-dim/50">
              <Image
                src={doctor.avatarUrl}
                alt={doctor.fullName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              <Icon name="favorite" size={10} filled />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="flex items-center gap-1">
              <span className="font-headline text-headline-sm lg:text-headline-lg text-on-primary leading-tight truncate">
                {doctor.fullName}
              </span>
              {doctor.isVerified && (
                <Icon name="verified" size={16} className="text-secondary-fixed" filled />
              )}
            </span>
            <p className="font-body text-body-sm lg:text-body-md text-on-primary-container line-clamp-1">
              {doctor.shortTitle} • FESC Fellow
            </p>
            <span className="font-label text-[10px] lg:text-label-md text-tertiary-fixed">
              {doctor.tagline}
            </span>
          </div>
        </div>

        <Link
          href="/haqqinda"
          className="hidden sm:inline-flex shrink-0 items-center gap-0.5 h-10 px-space-md rounded-md border border-tertiary-fixed-dim/40 font-label text-label-lg text-on-primary hover:bg-white/10 transition-colors"
        >
          Profil
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
    </section>
  );
}
