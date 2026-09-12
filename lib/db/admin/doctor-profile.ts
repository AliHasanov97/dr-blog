import { prisma } from "@/lib/prisma";

export async function dbGetDoctorProfileAdmin() {
  return prisma.doctorProfile.findFirst();
}

export async function dbUpdateDoctorProfile(data: Record<string, any>) {
  const profile = await prisma.doctorProfile.findFirst();
  if (!profile) {
    return prisma.doctorProfile.create({ data: data as any });
  }
  return prisma.doctorProfile.update({
    where: { id: profile.id },
    data,
  });
}
