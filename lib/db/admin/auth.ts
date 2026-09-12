import { prisma } from "@/lib/prisma";

export async function dbGetUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function dbGetUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function dbUpdateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
}

export async function dbSetResetToken(
  email: string,
  token: string,
  expiresAt: Date,
) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.isActive) return null;
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiresAt: expiresAt },
  });
  return user;
}

export async function dbGetUserByResetToken(token: string) {
  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiresAt) return null;
  if (user.resetTokenExpiresAt.getTime() < Date.now()) return null;
  return user;
}
