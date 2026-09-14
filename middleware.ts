import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";
import { siteConfig } from "@/lib/site";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * `.env`-dəki `MAINTENANCE_MODE=true` publik saytı bağlayır — admin panel
 * (`/admin/*`) toxunulmadan qalır ki, söndürən şəxs həmişə daxil ola bilsin.
 * `NEXT_PUBLIC_ENABLED_LOCALES` ilə eyni qayda: server səviyyəli, deployment
 * qərarı, admin paneldən DEYİL — dəyişmək server restartı tələb edir.
 */
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

const MAINTENANCE_HTML = `<!doctype html>
<html lang="az">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Texniki xidmət — ${siteConfig.name}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100dvh; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: #f9f9ff; color: #1a1c1e;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    text-align: center;
  }
  @media (prefers-color-scheme: dark) { body { background: #111318; color: #e2e2e6; } }
  .card { max-width: 26rem; }
  .icon { font-size: 40px; margin-bottom: 16px; }
  h1 { font-size: 1.375rem; margin: 0 0 8px; }
  p { font-size: 0.95rem; line-height: 1.5; opacity: 0.75; margin: 0; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">🛠️</div>
    <h1>Sayt texniki xidmətdədir</h1>
    <p>${siteConfig.name} bir azdan yenidən əlçatan olacaq. Zəhmət olmasa bir az sonra yenidən yoxlayın.</p>
  </div>
</body>
</html>`;

function maintenanceResponse(): NextResponse {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
    },
  });
}

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
 *   - `MAINTENANCE_MODE=true`-dursa admin xaric hər şey 503 səhifəsinə düşür
 *   - `/admin/*` → köhnə sessiya yoxlaması (dəyişməyib)
 *   - qalanı     → next-intl-in dil middleware-i (`/az`, `/ru` prefiksi)
 * `/media` və statik fayllar aşağıdakı `matcher`-də tamamilə xaric edilir —
 * heç birinə toxunulmur.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (MAINTENANCE_MODE && !pathname.startsWith("/admin")) {
    return maintenanceResponse();
  }

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
