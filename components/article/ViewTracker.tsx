"use client";

import { useEffect } from "react";
import { registerArticleView } from "@/app/(site)/meqaleler/[slug]/actions";

/**
 * Baxış sayğacı.
 *
 * Məqalə səhifəsi statik qurulur, ona görə baxış server render-ində deyil,
 * səhifə brauzerdə açılanda yazılır. Eyni oxucu eyni sessiyada səhifəni
 * neçə dəfə açsa da bir dəfə sayılır (React StrictMode-un ikiqat
 * çağırışı da bura düşür).
 */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `dr-viewed-${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage bağlıdırsa baxış hər açılışda sayılır */
    }
    void registerArticleView(slug);
  }, [slug]);

  return null;
}
