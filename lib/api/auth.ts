import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { mockCredentials } from "@/lib/auth/mock-users";
import { buildSession } from "@/lib/auth/session";
import type { AdminSession, LoginResult } from "@/lib/auth/types";
import { USE_MOCK } from "./config";
import {
  dbGetUserByEmail,
  dbGetUserById,
  dbGetUserByResetToken,
  dbSetResetToken,
  dbUpdateUserPassword,
} from "@/lib/db/admin";
import { dbGetArticleAuthor } from "@/lib/db/doctor";
import { sendMail, siteUrl } from "@/lib/mail";
import { resetPasswordEmail } from "@/lib/mail/templates";

export interface AuthActionResult {
  success: boolean;
  message?: string;
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 saat
const MOCK_MODE_MESSAGE =
  "Mock rejimində şifrə dəyişdirilə bilmir — baza qoşulanda işləyəcək.";

/**
 * Giriş.
 * Mock rejimdə `lib/auth/mock-users.ts` üzərində yoxlanılır.
 * Database rejimdə PostgreSQL-dəki `users` cədvəlindən yoxlanılır.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!USE_MOCK) {
    // Database authentication
    const user = await dbGetUserByEmail(email);

    if (!user || !user.isActive) {
      return { success: false, message: "E-poçt və ya şifrə yanlışdır." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: "E-poçt və ya şifrə yanlışdır." };
    }

    return {
      success: true,
      session: buildSession({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.toLowerCase() as "admin" | "editor",
        avatarUrl: user.avatarUrl ?? undefined,
      }),
    };
  }

  // Mock authentication
  const match = mockCredentials.find(
    (c) =>
      c.user.email.toLowerCase() === email.trim().toLowerCase() &&
      c.password === password,
  );

  if (!match) {
    return { success: false, message: "E-poçt və ya şifrə yanlışdır." };
  }

  return { success: true, session: buildSession(match.user) };
}

/**
 * Daxil olmuş istifadəçi öz şifrəsini dəyişir.
 * Cari şifrə yoxlanılır ki, kimsə açıq qalmış sessiyadan sui-istifadə etməsin.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthActionResult> {
  if (USE_MOCK) {
    return { success: false, message: MOCK_MODE_MESSAGE };
  }

  const user = await dbGetUserById(userId);
  if (!user) {
    return { success: false, message: "İstifadəçi tapılmadı." };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, message: "Cari şifrə yanlışdır." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await dbUpdateUserPassword(user.id, passwordHash);
  return { success: true, message: "Şifrəniz dəyişdirildi." };
}

/**
 * Şifrə bərpa linki göndərir.
 * E-poçt tapılmasa da UĞURLU cavab qaytarılır — əks halda hansı e-poçtların
 * qeydiyyatda olduğu üçüncü tərəfə bəlli olardı.
 */
export async function requestPasswordReset(
  email: string,
): Promise<AuthActionResult> {
  const generic = {
    success: true,
    message:
      "Bu e-poçt qeydiyyatdadırsa, bərpa linki göndərildi. Poçt qutunuzu yoxlayın.",
  };

  if (USE_MOCK) {
    return { success: false, message: MOCK_MODE_MESSAGE };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  const user = await dbSetResetToken(email, token, expiresAt);
  if (!user) return generic;

  const author = await dbGetArticleAuthor();
  const resetUrl = `${siteUrl()}/admin/sifre-sifirla?token=${token}`;
  const mail = resetPasswordEmail({
    resetUrl,
    brandName: author?.fullName ?? "Həkim",
  });
  await sendMail({
    to: user.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    fromName: author?.fullName,
  });

  return generic;
}

/** Bərpa tokeni ilə yeni şifrə təyin edir */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<AuthActionResult> {
  if (USE_MOCK) {
    return { success: false, message: MOCK_MODE_MESSAGE };
  }

  const user = await dbGetUserByResetToken(token);
  if (!user) {
    return {
      success: false,
      message: "Link etibarsızdır və ya vaxtı bitib. Yenidən tələb edin.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await dbUpdateUserPassword(user.id, passwordHash);
  return { success: true, message: "Şifrəniz yeniləndi. Daxil ola bilərsiniz." };
}
