import { cookies } from "next/headers";
import type { AdminSession } from "./types";

export const SESSION_COOKIE = "dr_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 saat

/**
 * DİQQƏT — mock sessiya.
 * Cookie sadəcə base64 JSON-dur, imzalanmır. Demo mərhələsi üçündür.
 * C# API qoşulanda bura JWT yazılacaq və doğrulama serverdə aparılacaq.
 */

export function encodeSession(session: AdminSession): string {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
}

export function decodeSession(value: string | undefined): AdminSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf-8"),
    ) as AdminSession;
    if (!parsed?.user?.email || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildSession(
  user: AdminSession["user"],
  accessToken?: string,
): AdminSession {
  return { user, accessToken, expiresAt: Date.now() + SESSION_TTL_MS };
}

/** Server komponentlərdə cari sessiyanı oxuyur */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(session: AdminSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
