import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { DoctorProfile } from "@/lib/types";

export interface LogoProps {
  doctor: DoctorProfile;
  /** Başlığın altındakı kontekst mətni (cari səhifə adı) */
  contextLabel?: string;
}

export function Logo({ doctor, contextLabel }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-space-sm min-w-0">
      <Image
        src="/images/logo-emblem.svg"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0"
        priority
      />
      <span className="flex flex-col min-w-0">
        <span className="flex items-center gap-space-2xs">
          <span className="font-headline text-headline-sm text-on-surface tracking-tight leading-tight truncate">
            {doctor.fullName}
          </span>
          {doctor.isVerified && (
            <Icon name="verified" size={16} className="text-secondary" filled />
          )}
        </span>
        <span className="flex items-center gap-space-2xs min-w-0">
          <span className="font-label text-label-sm uppercase tracking-wider text-secondary font-semibold truncate">
            {doctor.shortTitle}
          </span>
          {contextLabel && (
            <>
              <span className="text-outline/40 text-[10px]">•</span>
              <span className="font-label text-label-sm text-on-surface-variant truncate hidden sm:inline">
                {contextLabel}
              </span>
            </>
          )}
        </span>
      </span>
    </Link>
  );
}
