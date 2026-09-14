import { setRequestLocale } from "next-intl/server";
import { SiteHeader, BottomNav, SiteFooter, SplashScreen } from "@/components/layout";
import { getSearchIndex, getDoctorProfile } from "@/lib/api";
import { getSiteSettings } from "@/lib/admin/queries";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/** Publik saytın bəzəyi: üst panel, altlıq və mobil naviqasiya */
export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  /* Parametrlər admin panelindən idarə olunur. Əvvəllər burada mock anbarı
   * oxunurdu — baza rejimində admin nə saxlasa da açılış ekranı dəyişmirdi. */
  const [searchSuggestions, settings, doctor] = await Promise.all([
    /* Yalnız bir neçə təklif — bütün indeks deyil */
    getSearchIndex(undefined, 6, locale),
    getSiteSettings(locale),
    getDoctorProfile(locale),
  ]);
  const { loadingText, loadingLogo, loadingShowText, loadingShowLogo, multiLanguageEnabled } =
    settings;

  return (
    <div className="min-h-screen flex flex-col">
      <SplashScreen
        text={loadingText}
        logoUrl={loadingLogo || undefined}
        showText={loadingShowText}
        showLogo={loadingShowLogo}
      />
      <SiteHeader
        searchSuggestions={searchSuggestions}
        doctor={doctor}
        showLanguageSwitch={multiLanguageEnabled}
      />
      {children}
      <SiteFooter doctor={doctor} />
      <BottomNav />
    </div>
  );
}
