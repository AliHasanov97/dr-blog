"use client";

import { createContext, useContext } from "react";

const LanguageSupportContext = createContext(true);

export interface LanguageSupportProviderProps {
  /** `/admin/parametrler`-dəki "Dil dəstəyi" açarının cari vəziyyəti */
  enabled: boolean;
  children: React.ReactNode;
}

/**
 * Admin panelinin hər yerindən əlçatan: RU dili söndürülübsə (bax:
 * `SettingsForm.tsx`-dəki "Dil dəstəyi" bölməsi), bütün RU-ya aid idarəetmə
 * elementləri (dil filtri, dil seçimi, RU sahələri) admin paneldə heç yerdə
 * görünməməlidir — bu context hər komponentin ayrıca `getSiteSettings()`
 * çağırmasının qarşısını alır.
 */
export function LanguageSupportProvider({ enabled, children }: LanguageSupportProviderProps) {
  return (
    <LanguageSupportContext.Provider value={enabled}>{children}</LanguageSupportContext.Provider>
  );
}

/** RU admin paneldə göstərilməlidirmi */
export function useLanguageSupport(): boolean {
  return useContext(LanguageSupportContext);
}
