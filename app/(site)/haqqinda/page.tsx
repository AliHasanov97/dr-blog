import type { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
  const doctor = await getDoctorProfile();
  return {
    title: "Haqqında",
    description: `${doctor.fullName} — bioqrafiya, elmi dərəcələr, təhsil, tədqiqat sahələri və rəsmi kanallar.`,
  };
}

export default async function AboutPage() {
  const [doctor, channels] = await Promise.all([
    getDoctorProfile(),
    getContactChannels(),
  ]);

  return (
    <PageShell className="flex flex-col gap-space-xl lg:gap-space-2xl">
      <DoctorProfileHero doctor={doctor} />

      <StatsGrid stats={doctor.stats} />

      {/* Bioqrafiya */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title="Bioqrafiya & Elmi Yolum" icon="history_edu" />
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
        <SectionHeader title="Təhsil və İxtisaslaşma" icon="school" />
        <Card>
          <Timeline entries={doctor.education} />
        </Card>
      </section>

      {/* Tədqiqat sahələri */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title="Əsas Fəaliyyət və Maraq Dairəsi" icon="vital_signs" />
        <ResearchAreaList areas={doctor.researchAreas} />
      </section>

      {/* Sosial kanallar */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title="Sosial Şəbəkələr & Kanallar"
          icon="public"
          size="sm"
          hint="Rəqəmsal Maarifləndirmə"
        />
        <p className="font-body text-body-sm text-on-surface-variant">
          Kardioloji maarifləndirici videolar, elmi xülasələr və beynəlxalq
          tədqiqatları təqib etmək üçün rəsmi platformalar:
        </p>
        <SocialLinkList links={doctor.socialLinks} />
      </section>

      {/* Birbaşa əlaqə */}
      <section className="flex flex-col gap-space-md">
        <SectionHeader title="Birbaşa Əlaqə" icon="mail" />

        <Alert title="Vacib Qeyd" icon="info">
          Bu forma yalnız elmi əməkdaşlıq, mətbuat/müsahibə təklifləri və bloq
          məqalələrinə dair suallar üçündür. Qəbula yazılış həyata keçirilmir.
          Təcili vəziyyətlərdə dərhal {siteConfig.emergencyNumber} xidmətinə
          müraciət edin.
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

        <ContactForm
          title="Müraciət Forması"
          withConsent={false}
          withSubject={false}
        />
      </section>
    </PageShell>
  );
}
