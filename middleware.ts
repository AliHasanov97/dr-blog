import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * /admin altındakı bütün route-ları qoruyur.
 * Burada yalnız cookie-nin mövcudluğu və bitmə vaxtı yoxlanılır (Edge runtime);
 * tam doğrulama server komponentlərdəki `getSession()` ilə aparılır.
 */
function isSessionValid(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const json = JSON.parse(
      Buffer.from(value, "base64url").toString("utf-8"),
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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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

export const config = {
  matcher: ["/admin/:path*"],
};
