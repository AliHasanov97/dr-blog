import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout";
import {
  DoctorProfileHero,
  ResearchAreaList,
  SocialLinkList,
  StatsGrid,
  Timeline,
} from "@/components/doctor";
import { ContactForm } from "@/components/contact";
import { Alert, Card, Icon, SectionHeader } from "@/components/ui";
import { getContactChannels, getDoctorProfile } from "@/lib/api";
import { siteConfig } from "@/lib/site";

/*
 * Haqqında səhifəsi məzmunu bazadan gəlir. Konteynerdə qurulanda baza
 * əlçatan olmaya bilər — bu halda səhifə boş qurulur, sonra bir
 * dəqiqə ərzində özü yenilənir.
 */
export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [doctor, t] = await Promise.all([
    getDoctorProfile(locale),
    getTranslations({ locale, namespace: "about" }),
  ]);
  return {
    title: t("metaTitle"),
    description: t("metaDescription", { name: doctor.fullName }),
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [doctor, channels, t] = await Promise.all([
    getDoctorProfile(locale),
    getContactChannels(),
    getTranslations({ locale, namespace: "about" }),
  ]);

  return (
    <PageShell className="flex flex-col gap-space-xl lg:gap-space-2xl">
      <DoctorProfileHero doctor={doctor} />

      <StatsGrid stats={doctor.stats} />

      {/* Bioqrafiya */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title={t("biographyTitle")} icon="history_edu" />
        <Card className="flex flex-col gap-space-md">
          <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
            {doctor.biography}
          </p>
          <blockquote className="rounded-xl border-s-4 border-secondary bg-secondary/[0.07] p-space-md flex gap-space-sm">
            <Icon name="format_quote" size={20} className="text-secondary shrink-0" />
            <p className="font-display italic text-headline-sm text-on-surface leading-relaxed">
              «{doctor.quote}»
            </p>
          </blockquote>
        </Card>
      </section>

      {/* Təhsil */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title={t("educationTitle")} icon="school" />
        <Card>
          <Timeline entries={doctor.education} />
        </Card>
      </section>

      {/* Tədqiqat sahələri */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title={t("researchTitle")} icon="vital_signs" />
        <ResearchAreaList areas={doctor.researchAreas} />
      </section>

      {/* Sosial kanallar */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("socialTitle")}
          icon="public"
          size="sm"
          hint={t("socialHint")}
        />
        <p className="font-body text-body-sm text-on-surface-variant">
          {t("socialDescription")}
        </p>
        <SocialLinkList links={doctor.socialLinks} />
      </section>

      {/* Birbaşa əlaqə */}
      <section className="flex flex-col gap-space-md">
        <SectionHeader title={t("directContactTitle")} icon="mail" />

        <Alert title={t("importantNoteTitle")} icon="info">
          {t("importantNoteBody", { number: siteConfig.emergencyNumber })}
        </Alert>

        <div className="grid gap-space-sm sm:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.id} className="flex items-start gap-space-sm">
              <span className="w-9 h-9 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <Icon name={channel.icon} size={18} />
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="font-label text-label-md uppercase tracking-wider text-outline">
                  {channel.title}
                </span>
                <span className="font-body text-body-sm text-on-surface break-words">
                  {channel.values[0]}
                </span>
              </span>
            </Card>
          ))}
        </div>

        <ContactForm withConsent={false} withSubject={false} />
      </section>
    </PageShell>
  );
}
