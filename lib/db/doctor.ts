import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/i18n/translations";
import type { Author, DoctorProfile } from "@/lib/types";

/** `DoctorProfile.translations`-da dil kodu üzrə saxlanılan sahələr */
interface TranslatableDoctorFields {
  shortTitle: string;
  fullTitle: string;
  tagline: string;
  biography: string;
  quote: string;
  credentials: DoctorProfile["credentials"];
  stats: DoctorProfile["stats"];
  education: DoctorProfile["education"];
  researchAreas: DoctorProfile["researchAreas"];
}

export async function dbGetDoctorProfile(locale?: string): Promise<DoctorProfile | null> {
  const profile = await prisma.doctorProfile.findFirst();

  if (!profile) return null;

  const base: TranslatableDoctorFields = {
    shortTitle: profile.shortTitle,
    fullTitle: profile.fullTitle,
    tagline: profile.tagline ?? "",
    biography: profile.biography ?? "",
    quote: profile.quote ?? "",
    credentials: (profile.credentials as unknown as DoctorProfile["credentials"]) ?? [],
    stats: (profile.stats as unknown as DoctorProfile["stats"]) ?? [],
    education: (profile.education as unknown as DoctorProfile["education"]) ?? [],
    researchAreas: (profile.researchAreas as unknown as DoctorProfile["researchAreas"]) ?? [],
  };
  const resolved = pickTranslation(base, profile.translations, locale);

  return {
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl ?? "",
    portraitUrl: profile.portraitUrl ?? "",
    isVerified: profile.isVerified,
    ...resolved,
    /* Sosial linklər `/admin/elaqe`-də idarə olunur, hələlik tərcümə yoxdur */
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
      translations: true,
      avatarUrl: true,
      isVerified: true,
    },
  });

  if (!profile) return null;

  const { shortTitle } = pickTranslation(
    { shortTitle: profile.shortTitle },
    profile.translations,
    locale,
  );

  return {
    id: profile.id,
    fullName: profile.fullName,
    title: shortTitle,
    avatarUrl: profile.avatarUrl ?? "",
    isVerified: profile.isVerified,
  };
}
