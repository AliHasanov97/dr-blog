import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/admin/queries";
import "./globals.css";

/* RU üçün Open Graph locale kodu — admin (`/admin`) bu faylı da işlədir,
 * amma orada intl middleware işləmədiyi üçün `getLocale()` standart
 * dilə (az) düşür — düzgün nəticədir, əlavə şərtə ehtiyac yoxdur. */
const OG_LOCALES: Record<string, string> = { az: "az_AZ", ru: "ru_RU" };

/* Mətn şriftləri next/font ilə self-host edilir — layout shift olmur */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Sayt adı, şüarı və təsviri admin panelindəki «Tənzimləmələr»dən gəlir;
 * `siteConfig` yalnız baza əlçatmaz olduqda ehtiyat rolunu oynayır.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [locale, { siteName, tagline, description }] = await Promise.all([
    getLocale(),
    getSiteSettings().catch(() => ({
      siteName: siteConfig.name,
      tagline: siteConfig.title,
      description: siteConfig.description,
    })),
  ]);

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description,
    openGraph: {
      title: `${siteName} — ${tagline}`,
      description,
      locale: OG_LOCALES[locale] ?? OG_LOCALES.az,
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

/**
 * Kök layout — yalnız <html>/<body> və şriftlər. Həm sayt (`[locale]/(site)`),
 * həm admin (`admin/(panel)`) bunun altındadır — `lang` `getLocale()`-dən
 * gəlir (admin-də intl middleware işləmədiyi üçün standart "az"-a düşür).
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

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
        {/* Material Symbols — ikon şrifti (next/font ikon şriftlərini dəstəkləmir) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-secondary/20 selection:text-secondary">
        {children}
      </body>
    </html>
  );
}
