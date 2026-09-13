import { prisma } from "@/lib/prisma";
import type { Author, DoctorProfile } from "@/lib/types";

/** RU sahə boşdursa AZ mətnə geri qayıdır */
function pick(ru: string | null | undefined, az: string): string {
  return ru?.trim() ? ru : az;
}

/** RU JSON siyahısı boşdursa (heç yazılmayıb) AZ siyahıya geri qayıdır */
function pickList<T>(ru: unknown, az: unknown): T[] {
  const ruList = ru as T[] | null | undefined;
  if (Array.isArray(ruList) && ruList.length > 0) return ruList;
  return (az as T[] | null | undefined) ?? [];
}

export async function dbGetDoctorProfile(locale?: string): Promise<DoctorProfile | null> {
  const profile = await prisma.doctorProfile.findFirst();

  if (!profile) return null;

  const ru = locale === "ru";

  return {
    fullName: profile.fullName,
    shortTitle: ru ? pick(profile.shortTitleRu, profile.shortTitle) : profile.shortTitle,
    fullTitle: ru ? pick(profile.fullTitleRu, profile.fullTitle) : profile.fullTitle,
    avatarUrl: profile.avatarUrl ?? "",
    portraitUrl: profile.portraitUrl ?? "",
    isVerified: profile.isVerified,
    tagline: ru ? pick(profile.taglineRu, profile.tagline ?? "") : (profile.tagline ?? ""),
    biography: ru ? pick(profile.biographyRu, profile.biography ?? "") : (profile.biography ?? ""),
    quote: ru ? pick(profile.quoteRu, profile.quote ?? "") : (profile.quote ?? ""),
    credentials: ru
      ? pickList<DoctorProfile["credentials"][number]>(profile.credentialsRu, profile.credentials)
      : ((profile.credentials as unknown as DoctorProfile["credentials"]) ?? []),
    stats: ru
      ? pickList<DoctorProfile["stats"][number]>(profile.statsRu, profile.stats)
      : ((profile.stats as unknown as DoctorProfile["stats"]) ?? []),
    education: ru
      ? pickList<DoctorProfile["education"][number]>(profile.educationRu, profile.education)
      : ((profile.education as unknown as DoctorProfile["education"]) ?? []),
    researchAreas: ru
      ? pickList<DoctorProfile["researchAreas"][number]>(
          profile.researchAreasRu,
          profile.researchAreas,
        )
      : ((profile.researchAreas as unknown as DoctorProfile["researchAreas"]) ?? []),
    /* Sosial linklər `/admin/elaqe`-də idarə olunur, hələlik terceme yoxdur */
    socialLinks: (profile.socialLinks as unknown as DoctorProfile["socialLinks"]) ?? [],
  };
}

/**
 * Məqalələrin müəllif kartında göstərilən şəxs.
 *
 * Sayt bir həkimə aiddir — ayrıca Author cədvəli yoxdur, bu, ümumi
 * `DoctorProfile`-dan hesablanır. Beləliklə ad və ya şəkil dəyişəndə
 * (`/admin/hekim`) hər yerdə — məqalə kartlarında da — dərhal yenilənir,
 * ayrıca sinxronizasiya lazım gəlmir.
 */
export async function dbGetArticleAuthor(locale?: string): Promise<Author | null> {
  const profile = await prisma.doctorProfile.findFirst({
    select: {
      id: true,
      fullName: true,
      shortTitle: true,
      shortTitleRu: true,
      avatarUrl: true,
      isVerified: true,
    },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.fullName,
    title: locale === "ru" ? pick(profile.shortTitleRu, profile.shortTitle) : profile.shortTitle,
    avatarUrl: profile.avatarUrl ?? "",
    isVerified: profile.isVerified,
  };
}
