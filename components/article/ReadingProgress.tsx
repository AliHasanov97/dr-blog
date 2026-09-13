"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/** Səhifənin yuxarısında oxunma faizini göstərən nazik zolaq */
export function ReadingProgress() {
  const t = useTranslations("article");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label={t("readingProgress")}
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-20 inset-x-0 z-40 h-0.5 bg-surface-container"
    >
      <div
        className="h-full bg-secondary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
