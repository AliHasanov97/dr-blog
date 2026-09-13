import { defineRouting } from "next-intl/routing";

/**
 * Yalnız publik sayt (`app/[locale]/(site)`) lokallaşdırılır — admin panel
 * (`/admin`) və `/media` bundan kənardadır, tək dildə qalır.
 */
export const routing = defineRouting({
  locales: ["az", "ru"],
  defaultLocale: "az",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
