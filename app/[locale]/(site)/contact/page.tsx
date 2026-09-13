import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout";
import {
  ContactChannelCard,
  ContactForm,
  FaqList,
  LocationCard,
} from "@/components/contact";
import { SocialLinkList } from "@/components/doctor";
import { Badge, Icon, SectionHeader } from "@/components/ui";
import {
  getContactChannels,
  getDoctorProfile,
  getFaq,
  getOfficeLocation,
} from "@/lib/api";

/*
 * Əlaqə səhifəsi məzmunu bazadan gəlir. Konteynerdə qurulanda baza
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
    getTranslations({ locale, namespace: "contact" }),
  ]);
  return {
    title: t("metaTitle"),
    description: t("metaDescription", { name: doctor.fullName }),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [channels, office, faq, doctor, t] = await Promise.all([
    getContactChannels(),
    getOfficeLocation(),
    getFaq(locale),
    getDoctorProfile(locale),
    getTranslations({ locale, namespace: "contact" }),
  ]);

  return (
    <PageShell className="flex flex-col gap-space-xl lg:gap-space-2xl">
      {/* Başlıq */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs flex-wrap">
          <Badge tone="secondary" icon="verified" uppercase>
            {t("officialBadge")}
          </Badge>
          <Badge tone="tertiary" icon="schedule">
            {t("activeLineBadge")}
          </Badge>
        </div>
        <h1 className="font-headline text-headline-lg-mobile lg:text-display text-on-surface leading-tight">
          {t("heroTitle")}
        </h1>
        <p className="font-body text-body-md text-on-surface-variant leading-relaxed max-w-2xl">
          {t("heroDescription")}
        </p>
      </section>

      {/* Sürətli əlaqə kanalları — başlıqdan dərhal sonra, ən önəmli məzmun */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("quickChannelsTitle")}
          icon="contact_support"
          hint={t("quickChannelsHint")}
        />
        <div className="grid gap-space-md lg:grid-cols-3">
          {channels.map((channel) => (
            <ContactChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      </section>

      {/* Forma + lokasiya */}
      <div className="grid gap-space-xl lg:grid-cols-2 lg:gap-space-2xl">
        <section className="flex flex-col gap-space-sm">
          <SectionHeader title={t("formSectionTitle")} icon="edit_note" size="sm" />
          <ContactForm />
        </section>

        <section className="flex flex-col gap-space-sm">
          <SectionHeader
            title={t("locationSectionTitle")}
            icon="domain"
            size="sm"
            hint={office.city}
          />
          <LocationCard office={office} />
        </section>
      </div>

      {/* Sosial kanallar */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("socialSectionTitle")}
          icon="hub"
          size="sm"
          hint={t("socialSectionHint")}
        />
        <SocialLinkList links={doctor.socialLinks} />
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader title={t("faqSectionTitle")} icon="quiz" />
        <p className="font-body text-body-sm text-on-surface-variant">
          {t("faqSectionHint")}
        </p>
        <FaqList items={faq} />
      </section>

      {/* İmza sitatı */}
      <section className="relative overflow-hidden rounded-xl bg-primary-container text-on-primary p-space-lg lg:p-space-2xl">
        <span
          aria-hidden="true"
          className="absolute -right-16 -bottom-16 w-52 h-52 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
        />
        <div className="relative flex flex-col items-center text-center gap-space-xs">
          <Icon name="cardiology" size={28} className="text-secondary-fixed" />
          <p className="font-display italic text-headline-md lg:text-headline-lg text-on-primary leading-relaxed max-w-2xl">
            {t("quote")}
          </p>
          <span className="font-label text-label-md text-tertiary-fixed">
            {doctor.fullName} — {t("quoteAttribution")}
          </span>
        </div>
      </section>
    </PageShell>
  );
}
