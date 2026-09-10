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

export async function dbGetAuthor(): Promise<Author | null> {
  const author = await prisma.author.findFirst({
    where: { isVerified: true },
  });

  if (!author) return null;

  return {
    id: author.id,
    fullName: author.fullName,
    title: author.title,
    avatarUrl: author.avatarUrl ?? "",
    isVerified: author.isVerified,
  };
}
