import type { Metadata } from "next";
import { ButtonLink, EmptyState } from "@/components/ui";

/**
 * Bütün saytın kök 404 səhifəsi.
 *
 * `app/(site)/not-found.tsx` yalnız həmin qrupun layout ağacındakı
 * marşrutları (məs. mövcud olmayan məqalə slug-u) əhatə edir. Heç bir
 * route qrupuna uymayan ünvanlar (səhv yazılmış `/admin` yolları, təsadüfi
 * `/xyz` kimi) bura, kök layout-un içinə düşür — ona görə DB sorğusu YOXDUR:
 * 404 səhifəsinin özü bazadan asılı olsa, bazasız anda "səhifə tapılmadı"
 * əvəzinə başqa xəta göstərərdi.
 */
export const metadata: Metadata = {
  title: "Səhifə tapılmadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg px-margin-mobile py-space-3xl bg-surface">
      <EmptyState
        icon="find_in_page"
        title="404 — Səhifə tapılmadı"
        description="Axtardığınız ünvan mövcud deyil, silinib və ya səhv yazılıb."
      />
      <ButtonLink href="/" icon="home">
        Ana səhifəyə qayıt
      </ButtonLink>
    </div>
  );
}
