import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { routing, type AppLocale } from "@/i18n/routing";
import { RootHeadAssets, ThemeSync } from "@/components/layout";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/admin/queries";
import { newsreader, jakarta } from "@/lib/fonts";
import "../globals.css";

const OG_LOCALES: Record<AppLocale, string> = { az: "az_AZ", ru: "ru_RU" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Sayt üçün kök layout — `<html>/<body>`, şriftlər, tema skripti bura
 * daşındı (əvvəllər `app/layout.tsx`-də idi).
 *
 * Səbəb: köhnə ortaq kök layout (admin + sayt üçün BİR) `getLocale()`-i
 * şərtsiz çağırırdı. `[locale]` seqmenti o layout-dan AŞAĞIDA olduğu üçün
 * `getLocale()` heç vaxt statik/keşlənmiş dili görə bilmirdi, hər dəfə
 * HTTP başlıqlarına müraciət etməli olurdu — next-intl-in bu API-si isə
 * `generateStaticParams`/ISR (`revalidate`) ilə işləyən səhifələrdə
 * (məqalə detalı) `DYNAMIC_SERVER_USAGE` bail-out-u atırdı, bu da arxa
 * fonda yenilənmə cəhdlərini uğursuz edirdi (production-da müşahidə
 * olundu). İndi `[locale]` özü kök seqmentdir — dil `params`-dan gəlir,
 * heç bir dinamik API-yə ehtiyac yoxdur.
 */
export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const { siteName, tagline, description } = await getSiteSettings(locale).catch(
    () => ({
      siteName: siteConfig.name,
      tagline: siteConfig.title,
      description: siteConfig.description,
    }),
  );

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      title: `${siteName} — ${tagline}`,
      description,
      locale: OG_LOCALES[locale as AppLocale] ?? OG_LOCALES[routing.defaultLocale],
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f9f9ff",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  /* Statik render optimizasiyası üçün — next-intl-in tövsiyə etdiyi qayda */
  setRequestLocale(locale);

  /*
   * Admin RU dilini söndürə bilər (bax: /admin/parametrler). Söndürülübsə
   * RU saytın hər sorğusu bura çatmadan `/az`-a yönləndirilir — RU məzmun
   * silinmir, sadəcə əlçatmaz olur. AZ (default dil) heç vaxt bağlanmır.
   */
  if (locale !== routing.defaultLocale) {
    const settings = await getSiteSettings().catch(() => null);
    if (settings && !settings.multiLanguageEnabled) {
      redirect(`/${routing.defaultLocale}`);
    }
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
         * Tema seçimi localStorage-dan burada, boyanmazdan əvvəl oxunur —
         * əks halda səhifə açıq temada çəkilib sonra tünd temaya "atlayardı"
         * (FOUC). Default HƏMİŞƏ açıqdır, yalnız açıq şəkildə "dark"
         * saxlanılıbsa dəyişir (bax: ThemeToggle.tsx).
         */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}`,
          }}
        />
        <RootHeadAssets />
      </head>
      <body className="min-h-screen antialiased selection:bg-secondary/20 selection:text-secondary">
        <ThemeSync />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
