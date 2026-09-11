import Image from "next/image";
import { Badge, ButtonLink, Icon } from "@/components/ui";
import { Container } from "@/components/layout";
import type { DoctorProfile } from "@/lib/types";

export interface HomeHeroProps {
  doctor: DoctorProfile;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  /** Hero-nun altındakı kiçik "son nəşr" lenti üçün */
  latestTitle?: string;
  latestHref?: string;
}

/**
 * Landing hero — tam enli tünd redaksiya bandı.
 * Mobil: portret üstdə, mətn altda. Desktop: 7/5 asimmetrik grid.
 */
export function HomeHero({
  doctor,
  heroEyebrow,
  heroHeadline,
  heroDescription,
  latestTitle,
  latestHref,
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary-container text-on-primary">
      {/* Ambient işıq ləkələri */}
      <span
        aria-hidden="true"
        className="absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-secondary/20 blur-[120px] pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-56 -left-40 w-[32rem] h-[32rem] rounded-full bg-tertiary-fixed/10 blur-[120px] pointer-events-none"
      />
      {/* İncə şəbəkə */}
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <Container className="relative py-space-2xl lg:py-space-3xl">
        <div className="grid gap-space-xl lg:grid-cols-12 lg:gap-space-3xl lg:items-center">
          {/* --- Mətn sütunu --- */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <span className="flex items-center gap-space-xs">
              <span className="h-px w-8 bg-tertiary-fixed-dim/60" aria-hidden="true" />
              <span className="font-label text-label-md uppercase tracking-[0.18em] text-tertiary-fixed">
                {heroEyebrow}
              </span>
            </span>

            <h1 className="font-display text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] lg:text-[56px] lg:leading-[64px] tracking-tight text-on-primary text-balance">
              {heroHeadline}
            </h1>

            <p className="font-body text-body-md lg:text-body-lg text-on-primary-container max-w-xl leading-relaxed">
              {doctor.fullName} — {doctor.fullTitle}. {heroDescription}
            </p>

            <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs">
              <ButtonLink href="/meqaleler" variant="tonal" size="lg" icon="menu_book">
                Məqalələri oxu
              </ButtonLink>
              <ButtonLink
                href="/haqqinda"
                size="lg"
                icon="arrow_forward"
                iconPosition="end"
                className="bg-transparent border-white/25 text-on-primary hover:bg-white/10"
              >
                Həkim haqqında
              </ButtonLink>
            </div>

            <div className="flex flex-wrap gap-space-xs pt-space-xs">
              {doctor.credentials.map((c) => (
                <Badge key={c.label} icon={c.icon} tone="glass">
                  {c.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* --- Portret sütunu --- */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[15rem] sm:max-w-[20rem] lg:max-w-[22rem]">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden ring-1 ring-tertiary-fixed-dim/30 shadow-level-2">
                <Image
                  src={doctor.portraitUrl}
                  alt={doctor.fullName}
                  fill
                  sizes="(min-width: 1024px) 22rem, 60vw"
                  className="object-cover"
                  priority
                />
                <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-container/70 to-transparent" />
                {doctor.isVerified && (
                  <span className="absolute top-space-sm right-space-sm inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 font-label text-label-sm text-on-secondary-container">
                    <Icon name="verified" size={13} filled />
                    Təsdiqlənmiş həkim
                  </span>
                )}
              </div>

              {/* Üzən statistika kartı */}
              <div className="absolute -bottom-6 -left-10 hidden lg:flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-level-2">
                <span className="w-9 h-9 rounded-full bg-secondary/12 flex items-center justify-center text-secondary">
                  <Icon name="cardiology" size={20} />
                </span>
                <span className="flex flex-col">
                  <span className="font-headline text-headline-sm text-on-surface leading-none">
                    {doctor.stats[0]?.value}
                  </span>
                  <span className="font-label text-label-sm text-outline">
                    {doctor.stats[0]?.label}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Son nəşr lenti */}
        {latestTitle && latestHref && (
          <a
            href={latestHref}
            className="group relative mt-space-2xl lg:mt-space-3xl flex items-center gap-space-sm rounded-lg border border-white/12 bg-white/[0.06] px-space-md py-space-sm hover:bg-white/10 transition-colors"
          >
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-label text-label-sm text-on-secondary uppercase tracking-wider">
              <Icon name="bolt" size={12} />
              Yeni
            </span>
            <span className="font-body text-body-sm text-on-primary truncate">
              {latestTitle}
            </span>
            <Icon
              name="arrow_forward"
              size={16}
              className="ms-auto shrink-0 text-tertiary-fixed group-hover:translate-x-0.5 transition-transform"
            />
          </a>
        )}
      </Container>
    </section>
  );
}
