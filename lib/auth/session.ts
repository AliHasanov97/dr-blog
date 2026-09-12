import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminSession } from "./types";

export { SESSION_COOKIE } from "./session-cookie";
import { SESSION_COOKIE } from "./session-cookie";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 saat

/**
 * Sessiya cookie-si HMAC-SHA256 ilə imzalanır: `<base64url(JSON)>.<imza>`.
 * İmzasız cookie qəbul edilmir — əks halda istənilən kəs `dr_admin_session`
 * dəyərini özü uydurub admin kimi daxil ola bilərdi (bu tam belə idi, JWT-yə
 * keçmək əvəzinə burada sadəcə imza əlavə olunub).
 *
 * `SESSION_SECRET` təyin edilməyibsə istehsalatda tətbiq açılmır — yerli
 * inkişafda unudulsa belə çalışsın deyə orada sadəcə xəbərdarlıqla davam edir.
 */
function getSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] SESSION_SECRET təyin edilməyib. .env faylına əlavə edin " +
        "(məsələn: `node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\"`), " +
        "əks halda sessiya cookie-si imzalana bilməz.",
    );
  }
  console.warn(
    "[auth] SESSION_SECRET təyin edilməyib — müvəqqəti, təhlükəsiz olmayan açardan istifadə olunur. " +
      "Bu YALNIZ yerli inkişaf üçün qəbul edilir.",
  );
  return "dev-only-insecure-secret-do-not-use-in-production";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf-8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(value: string | undefined): AdminSession | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  const expected = sign(payload);

  /* Uzunluqları fərqli buferləri `timingSafeEqual`-a vermək xəta atır —
   * ona görə əvvəlcə uzunluq yoxlanılır, sonra sabit-vaxtlı müqayisə edilir. */
  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (provided.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(provided, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
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
