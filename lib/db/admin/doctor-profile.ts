import { prisma } from "@/lib/prisma";
import { removeStoredFile } from "@/lib/admin/storage";

export async function dbGetDoctorProfileAdmin() {
  return prisma.doctorProfile.findFirst();
}

export async function dbUpdateDoctorProfile(data: Record<string, any>) {
  const profile = await prisma.doctorProfile.findFirst();
  if (!profile) {
    return prisma.doctorProfile.create({ data: data as any });
  }

  const updated = await prisma.doctorProfile.update({
    where: { id: profile.id },
    data,
  });

  /* Şəkil əvəz olunubsa köhnəsi R2-də yetim qalmasın */
  if ("avatarUrl" in data && profile.avatarUrl !== data.avatarUrl) {
    await removeStoredFile(profile.avatarUrl);
  }
  if ("portraitUrl" in data && profile.portraitUrl !== data.portraitUrl) {
    await removeStoredFile(profile.portraitUrl);
  }

  return updated;
}
