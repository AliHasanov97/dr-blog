import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * /admin altındakı bütün route-ları qoruyur.
 * Burada yalnız cookie-nin mövcudluğu və bitmə vaxtı yoxlanılır (Edge runtime);
 * tam doğrulama, imza yoxlaması daxil, server komponentlərdəki `getSession()`
 * ilə aparılır (bax: `lib/auth/session.ts`).
 *
 * Cookie dəyəri `<base64url payload>.<imza>` formatındadır — imzanı burada
 * yoxlamırıq (Edge Runtime `node:crypto`-nu dəstəkləmir), sadəcə nöqtədən
 * əvvəlki hissəni ayırıb bitmə vaxtına baxırıq.
 */
function isSessionValid(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const dot = value.lastIndexOf(".");
    const payload = dot === -1 ? value : value.slice(0, dot);
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { expiresAt?: number };
    return typeof json.expiresAt === "number" && json.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/** Sessiya olmadan da açıla bilən səhifələr */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/sifre-berpa",
  "/admin/sifre-sifirla",
];

/**
 * Admin (`/admin/*`) və publik sayt (`[locale]/(site)`) eyni middleware
 * faylını paylaşır — hər sorğu üçün yalnız biri işə düşür:
 *   - `/admin/*` → köhnə sessiya yoxlaması (dəyişməyib)
 *   - qalanı     → next-intl-in dil middleware-i (`/az`, `/ru` prefiksi)
 * `/media` və statik fayllar aşağıdakı `matcher`-də tamamilə xaric edilir —
 * heç birinə toxunulmur.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const valid = isSessionValid(request.cookies.get(SESSION_COOKIE)?.value);
    const isPublicPage = PUBLIC_ADMIN_PATHS.includes(pathname);
    const isLoginPage = pathname === "/admin/login";

    if (!valid && !isPublicPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }

    if (valid && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|media|favicon.ico|.*\\..*).*)",
  ],
};
