import Image from "next/image";
import { Badge, Icon } from "@/components/ui";
import type { DoctorProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DoctorProfileHeroProps {
  doctor: DoctorProfile;
  className?: string;
}

/** Haqqında səhifəsinin portret + titul bloku */
export function DoctorProfileHero({ doctor, className }: DoctorProfileHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary-container text-on-primary shadow-level-2",
        "p-space-lg lg:p-space-2xl",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col items-center text-center gap-space-md lg:flex-row lg:text-start lg:items-center lg:gap-space-2xl">
        <div className="relative shrink-0">
          <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-xl overflow-hidden ring-2 ring-tertiary-fixed-dim/50 shadow-level-2">
            <Image
              src={doctor.portraitUrl}
              alt={doctor.fullName}
              width={160}
              height={160}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          {doctor.isVerified && (
            <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <Icon name="verified" size={18} filled />
            </span>
          )}
        </div>

        <div className="flex flex-col items-center lg:items-start gap-space-xs min-w-0">
          <h1 className="font-headline text-headline-lg-mobile lg:text-display text-on-primary leading-tight">
            {doctor.fullName}
          </h1>
          <p className="font-body text-body-md text-on-primary-container max-w-lg">
            {doctor.fullTitle}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-space-xs pt-space-2xs">
            {doctor.credentials.map((c) => (
              <Badge key={c.label} icon={c.icon} tone="glass">
                {c.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
