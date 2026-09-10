# Dr. Nərmin Əliyeva — Front-end

Stitch dizaynı (`stitch_modern_doctor_blog_redesign`) əsasında qurulmuş
**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4** layihəsi.

Hazırda bütün məlumatlar **mock data**-dan gəlir. C# API hazır olduqda yalnız
`lib/api/` qatı dəyişəcək — komponentlərə toxunmaq lazım deyil.

---

## Başlanğıc

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produksiya build
npm run lint     # ESLint
```

> `next/font` build zamanı Google Fonts-dan Newsreader və Plus Jakarta Sans
> şriftlərini endirir, ona görə ilk build üçün internet bağlantısı lazımdır.

---

## Səhifələr

Route-lar iki qrupa bölünüb: `app/(site)/` publik sayt (üst panel + altlıq),
`app/admin/` isə idarə paneli (öz sidebar bəzəyi ilə). Kök `app/layout.tsx`
yalnız `<html>/<body>` və şriftləri saxlayır.

| Route | Stitch ekranı | Fayl |
|---|---|---|
| `/` | Ana Səhifə | `app/(site)/page.tsx` |
| `/meqaleler` | Bloq və Elmi Məqalələr | `app/(site)/meqaleler/page.tsx` |
| `/meqaleler/[slug]` | Məqalə Detallı Oxu | `app/(site)/meqaleler/[slug]/page.tsx` |
| `/haqqinda` | Haqqımda və Əlaqə | `app/(site)/haqqinda/page.tsx` |
| `/elaqe` | Əlaqə | `app/(site)/elaqe/page.tsx` |

## İdarə paneli

Giriş: **`/admin/login`**

Demo hesabları (yalnız mock mərhələ — `lib/auth/mock-users.ts`):

| E-poçt | Şifrə | Rol |
|---|---|---|
| `admin@drnarmin.az` | `Admin123!` | Administrator |
| `redaktor@drnarmin.az` | `Redaktor123!` | Redaktor |

### Modullar

| Route | Nə edir |
|---|---|
| `/admin` | Statistika, ən çox oxunanlar, moderasiya və müraciət xülasəsi |
| `/admin/meqaleler` | Siyahı + filtr, status dəyişimi, silmə |
| `/admin/meqaleler/yeni`, `/[id]` | Blok redaktoru, parametrlər, istinadlar |
| `/admin/kateqoriyalar` | Kateqoriya CRUD |
| `/admin/qeydler` | Həkimin qeydləri |
| `/admin/videolar` | CardioTalk videoları |
| `/admin/beledciler` | Pasiyent bələdçiləri |
| `/admin/protokollar` | PDF protokolları |
| `/admin/luget` | Tibbi terminlər |
| `/admin/serhler` | Şərh moderasiyası + həkim adından cavab |
| `/admin/muracietler` | Müraciət gələnlər qutusu |
| `/admin/abuneciler` | Bülleten abunəçiləri |
| `/admin/hekim` | Həkim profili (bio, timeline, tədqiqat, kanallar) |
| `/admin/elaqe` | Əlaqə kanalları, klinika qrafiki, FAQ |
| `/admin/parametrler` | Sayt kimliyi və funksiya açarları |

### Auth

- `middleware.ts` `/admin/*` route-larını qoruyur və `/admin/login`-ə yönləndirir.
- Sessiya httpOnly cookie-də saxlanılır (`lib/auth/session.ts`).
  **Mock mərhələdə cookie imzalanmır** — C# API qoşulanda ora JWT yazılacaq və
  doğrulama serverdə aparılacaq.
- `lib/api/auth.ts` → `POST /auth/login` endpoint-inə hazırdır.

### Data

Admin və publik sayt eyni **in-memory anbardan** (`lib/mock/store.ts`) oxuyur —
paneldə etdiyiniz dəyişiklik dərhal saytda görünür. Data prosesin yaddaşındadır:
`npm run dev` yenidən başlayanda ilkin vəziyyətə qayıdır.

Layout mobil-öncəlikli (Stitch-ə sadiq), `lg` breakpoint-dən sonra desktop
grid-ə keçir: üst naviqasiya + altlıq görünür, mobil alt naviqasiya gizlənir.

---

## Qovluq strukturu

```
app/                    # Route-lar (server komponentlər)
components/
  ui/                   # Baza dizayn sistemi: Button, Card, Badge, Chip,
                        # Field (input/textarea/select/checkbox), Accordion,
                        # Alert, SearchBar, SectionHeader, Icon, EmptyState
  layout/               # SiteHeader, BottomNav, SiteFooter, Container, PageShell
  home/                 # Ana səhifəyə xas bloklar
  articles/             # Məqalə kartları, kataloq, video/bələdçi/protokol
  article/              # Məqalə detal səhifəsinin blokları
  doctor/               # Profil hero, statistika, timeline, sosial kanallar
  contact/              # Əlaqə kanalları, forma, lokasiya, FAQ
lib/
  types.ts              # Bütün domain modelləri (API müqaviləsi)
  api/                  # Service qatı — komponentlər yalnız buradan data alır
  mock/                 # Müvəqqəti mock data
  site.ts               # Naviqasiya və sayt konfiqurasiyası
  utils.ts              # cn(), formatNumber()
public/images/          # SVG placeholder şəkillər
```

### Komponent prinsipləri

- Hər komponent `export interface XProps` ilə tipləndirilib.
- Vizual variantlar `variant` prop-u ilə idarə olunur
  (`ArticleCard`: `featured | compact | list`; `Button`: `primary | secondary | ghost | tonal`).
- `"use client"` yalnız interaktiv komponentlərdə (filtr, forma, akkordeon,
  oxunma tərəqqisi). Səhifələr server komponentdir.

---

## Dizayn token-ləri

`DESIGN.md`-dəki bütün token-lər `app/globals.css` faylında Tailwind v4
`@theme` bloku kimi təyin olunub. Bu o deməkdir ki, Stitch HTML-indəki
class adları birbaşa işləyir:

```html
<div class="bg-surface-container-lowest text-on-surface p-card-padding rounded-xl shadow-level-1">
```

| Qrup | Nümunə |
|---|---|
| Rəng | `bg-surface`, `text-on-surface-variant`, `border-outline-variant`, `bg-primary-container` |
| Tipoqrafiya | `font-headline text-headline-md`, `font-body text-body-sm`, `font-label text-label-sm` |
| Boşluq | `p-space-md`, `gap-space-xs`, `px-margin-mobile`, `p-card-padding` |
| Elevasiya | `shadow-level-1`, `shadow-level-2` |

---

## API-yə keçid (C# backend)

1. Kök qovluqda `.env.local` yaradın:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7001/api
NEXT_PUBLIC_USE_MOCK=false
```

2. Backend `lib/types.ts`-dəki modellərə uyğun JSON qaytarmalıdır.

Gözlənilən endpoint-lər (`lib/api/` içində artıq yazılıb):

| Metod | Endpoint | Funksiya |
|---|---|---|
| GET | `/articles?category=&search=&page=&pageSize=` | `getArticles` |
| GET | `/articles/featured` | `getFeaturedArticle` |
| GET | `/articles/slugs` | `getArticleSlugs` |
| GET | `/articles/{slug}` | `getArticleBySlug` |
| GET | `/articles/{slug}/related` | `getRelatedArticles` |
| GET | `/articles/{slug}/comments` | `getComments` |
| POST | `/articles/{slug}/comments` | `postComment` |
| GET | `/categories` | `getCategories` |
| GET | `/doctor/profile` | `getDoctorProfile` |
| GET | `/contact/channels`, `/contact/office`, `/contact/faq` | əlaqə məlumatları |
| POST | `/contact/messages` | `submitContactForm` |
| POST | `/newsletter/subscribe` | `subscribeNewsletter` |

Xəta idarəetməsi `lib/api/http.ts` içindəki `ApiError` sinfi ilə edilir.

### Məqalə gövdəsinin formatı

Məqalə mətni HTML deyil, struktur bloklar massivi kimi saxlanılır
(`ArticleBlock`): `lead`, `heading`, `paragraph`, `quote`, `checklist`, `image`.
Backend eyni formatı qaytarsa, `ArticleBody` komponenti dəyişmədən işləyəcək.

---

## Şəkillər

`public/images/` içindəki SVG-lər müvəqqəti placeholder-lərdir. Real şəkillər
uzaq serverdən gələcəksə, `next.config.ts` faylında `images.remotePatterns`
siyahısına həmin domeni əlavə edin.
