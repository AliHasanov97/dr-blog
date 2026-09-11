import { prisma } from "@/lib/prisma";
import type { Author, DoctorProfile } from "@/lib/types";

export async function dbGetDoctorProfile(): Promise<DoctorProfile | null> {
  const profile = await prisma.doctorProfile.findFirst();

  if (!profile) return null;

  return {
    fullName: profile.fullName,
    shortTitle: profile.shortTitle,
    fullTitle: profile.fullTitle,
    avatarUrl: profile.avatarUrl ?? "",
    portraitUrl: profile.portraitUrl ?? "",
    isVerified: profile.isVerified,
    tagline: profile.tagline ?? "",
    biography: profile.biography ?? "",
    quote: profile.quote ?? "",
    credentials: (profile.credentials as unknown as DoctorProfile["credentials"]) ?? [],
    stats: (profile.stats as unknown as DoctorProfile["stats"]) ?? [],
    education: (profile.education as unknown as DoctorProfile["education"]) ?? [],
    researchAreas: (profile.researchAreas as unknown as DoctorProfile["researchAreas"]) ?? [],
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
export async function dbGetArticleAuthor(): Promise<Author | null> {
  const profile = await prisma.doctorProfile.findFirst({
    select: {
      id: true,
      fullName: true,
      shortTitle: true,
      avatarUrl: true,
      isVerified: true,
    },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.fullName,
    title: profile.shortTitle,
    avatarUrl: profile.avatarUrl ?? "",
    isVerified: profile.isVerified,
  };
}
