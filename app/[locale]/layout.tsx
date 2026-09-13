import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Kök layout (`app/layout.tsx`) ilə sayt bəzəyi (`(site)/layout.tsx`) arasında
 * — dil parametrini doğrulayır və tərcümələri client komponentlərinə ötürür.
 * Admin panel bundan kənardadır, `[locale]` seqmentinə daxil deyil.
 */
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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
