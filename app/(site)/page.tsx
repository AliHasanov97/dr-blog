import { getSiteSettings } from "@/lib/admin/queries";
import { Container, PageShell } from "@/components/layout";
import { HomeArticleFeed, HomeHero, StatStrip } from "@/components/home";
import { NewsletterCard } from "@/components/articles";
import { ButtonLink, Card, Icon, SectionHeader } from "@/components/ui";
import {
  getArticles,
  getDoctorProfile,
  getHomeFilters,
} from "@/lib/api";

/*
 * Ana səhifə məzmunu bazadan gəlir. Konteynerdə qurulanda baza
 * əlçatan olmaya bilər — bu halda səhifə boş qurulur, sonra bir
 * dəqiqə ərzində özü yenilənir.
 */
export const revalidate = 60;

export default async function HomePage() {
  const [doctor, articlesPage, filters, settings] = await Promise.all([
    getDoctorProfile(),
    getArticles({ pageSize: 6 }),
    getHomeFilters(),
    getSiteSettings(),
  ]);

  const latest = articlesPage.items[0];

  return (
    <PageShell width="bleed">
      <HomeHero
        doctor={doctor}
        latestTitle={latest?.title}
        latestHref={latest ? `/meqaleler/${latest.slug}` : undefined}
      />

      <StatStrip stats={doctor.stats} />

      <Container className="py-space-2xl lg:py-space-3xl flex flex-col gap-space-2xl lg:gap-space-3xl">
        <HomeArticleFeed articles={articlesPage.items} filters={filters} />

        {/* Tədqiqat sahələri */}
        <section>
          <Card className="flex flex-col gap-space-md">
            <span className="flex items-center gap-space-xs">
              <span className="h-px w-6 bg-tertiary-fixed-dim" aria-hidden="true" />
              <span className="font-label text-label-sm uppercase tracking-[0.16em] text-on-tertiary-container">
                Tədqiqat sahələri
              </span>
            </span>
            <ul className="flex flex-col gap-space-sm">
              {doctor.researchAreas.slice(0, 4).map((area) => (
                <li key={area.id} className="flex items-start gap-space-sm">
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <Icon name={area.icon} size={17} />
                  </span>
                  <span className="font-body text-body-sm text-on-surface leading-snug pt-1.5">
                    {area.title}
                  </span>
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/haqqinda"
              variant="secondary"
              icon="arrow_forward"
              iconPosition="end"
              fullWidth
            >
              Tam profilə bax
            </ButtonLink>
          </Card>
        </section>

        {settings.newsletterEnabled && <NewsletterCard />}
      </Container>
    </PageShell>
  );
}
