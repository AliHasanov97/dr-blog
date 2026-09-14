import { prisma } from "@/lib/prisma";
import { removeStoredFile } from "@/lib/admin/storage";
import { mergeTranslations } from "@/lib/i18n/translations";

export async function dbGetDoctorProfileAdmin() {
  return prisma.doctorProfile.findFirst();
}

export async function dbUpdateDoctorProfile(data: Record<string, any>) {
  const profile = await prisma.doctorProfile.findFirst();
  if (!profile) {
    return prisma.doctorProfile.create({ data: data as any });
  }

  /* Redaktə olunmayan (söndürülmüş) dillərin köhnə tərcüməsi silinməsin */
  const mergedData =
    "translations" in data
      ? { ...data, translations: mergeTranslations(profile.translations, data.translations) }
      : data;

  const updated = await prisma.doctorProfile.update({
    where: { id: profile.id },
    data: mergedData,
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
