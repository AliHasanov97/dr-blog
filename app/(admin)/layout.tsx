import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { RootHeadAssets } from "@/components/layout";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/admin/queries";
import { newsreader, jakarta } from "@/lib/fonts";
import "../globals.css";

/**
 * Admin panelin kök layout-u — həmişə Azərbaycanca, `[locale]` seqmentinə
 * daxil deyil. Əvvəllər sayt ilə eyni kök layout-u paylaşırdı, amma o
 * layout `getLocale()`-i şərtsiz çağırdığı üçün (next-intl-in dinamik
 * API-si) hər sorğunu "dinamik" işarələyirdi — bu, sayt tərəfində
 * `generateStaticParams`/ISR ilə birgə `DYNAMIC_SERVER_USAGE` bail-out-una
 * səbəb olurdu (bax: `[locale]/layout.tsx`-dəki izahat). Admin ayrıca kök
 * layout-a keçəndə iki tərəf artıq bir-birinə mane olmur.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName, tagline, description } = await getSiteSettings().catch(
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
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f9f9ff",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="az"
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
        {children}
      </body>
    </html>
  );
}
