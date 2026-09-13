"use client";

import { useEffect } from "react";

/**
 * `<html>`-ə `data-theme` atributunu bərpa edir.
 *
 * Dil dəyişəndə (`/az` → `/ru`) Next.js kök layout-u (`[locale]/layout.tsx`)
 * yenidən qurur — bu, `beforeInteractive` skriptin (`app/[locale]/layout.tsx`-
 * dəki `theme-init`) imperativ şəkildə qoyduğu `data-theme` atributunu silir
 * (o skript yalnız İLK tam yüklənişdə işləyir, sonrakı client-side keçidlərdə
 * yox). Nəticədə tünd tema seçilmiş olsa belə səhifə açıq görünürdü.
 *
 * Bu komponent hər mount-da (ilk yüklənişdə VƏ hər kök layout təzələnməsində)
 * `localStorage`-dakı saxlanmış seçimi yenidən tətbiq edir — beləliklə tema
 * dil keçidindən sağ çıxır.
 */
export function ThemeSync() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const current = document.documentElement.getAttribute("data-theme");
      if (stored === "dark" && current !== "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else if (stored !== "dark" && current === "dark") {
        document.documentElement.removeAttribute("data-theme");
      }
    } catch {
      /* Gizli/məhdud brauzer rejimi — tema sadəcə tətbiq olunmur */
    }
  });

  return null;
}
