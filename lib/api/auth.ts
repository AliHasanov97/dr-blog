import bcrypt from "bcryptjs";
import { mockCredentials } from "@/lib/auth/mock-users";
import { buildSession } from "@/lib/auth/session";
import type { AdminSession, LoginResult } from "@/lib/auth/types";
import { USE_MOCK } from "./config";
import { dbGetUserByEmail } from "@/lib/db/admin";

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
