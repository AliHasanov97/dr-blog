# Dr. Ələkbər Zeynili — Kardiologiya Bloqu

Tək həkimə aid tibbi bloq və idarə paneli.
**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + PostgreSQL (Prisma)**.

Sayt real bazadan işləyir: məqalələr, şərhlər, müraciətlər, bülleten
abunəçiləri, həkim profili və sayt parametrləri PostgreSQL-də saxlanılır.
Baza qoşulmadığı yerli sınaqlar üçün `lib/mock/` altında paralel bir mock
qat da saxlanılır (bax aşağıda **Mock rejim**).

---

## Başlanğıc

```bash
npm install

# Baza (PostgreSQL) lazımdır — .env faylında DATABASE_URL göstərin
npm run db:push      # sxemi bazaya tətbiq edir
npm run db:seed       # nümunə məqalə, kateqoriya, admin istifadəçi və s.

npm run dev            # http://localhost:3000
npm run build           # produksiya build
npm run lint             # ESLint
```

Faydalı Prisma skriptləri:

| Skript | Nə edir |
|---|---|
| `npm run db:push` | `prisma/schema.prisma`-nı bazaya tətbiq edir (miqrasiyasız) |
| `npm run db:seed` | `prisma/seed.ts` — nümunə data + admin/redaktor hesabları yaradır |
| `npm run db:studio` | Prisma Studio (bazanı brauzerdə görmək/redaktə etmək) |
| `npm run db:reset` | Bazanı tam sıfırlayır və yenidən seed edir (**dağıdıcıdır**) |

> `next/font` build zamanı Google Fonts-dan Newsreader və Plus Jakarta Sans
> şriftlərini endirir, ona görə ilk build üçün internet bağlantısı lazımdır.

---

## Environment dəyişənləri

Nümunə üçün `.env.example`-ə baxın. Əsas qruplar:

| Qrup | Dəyişənlər | Nə üçün |
|---|---|---|
| Baza | `DATABASE_URL` | PostgreSQL bağlantı sətri |
| Rejim | `NEXT_PUBLIC_USE_MOCK` | `false` → real baza, `true` → `lib/mock/*` (aşağıya bax) |
| Sayt | `NEXT_PUBLIC_SITE_URL` | Məktublardakı linklərin baza ünvanı |
| Poçt | `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM_NAME` | Gmail SMTP ilə şərh/müraciət/bülleten/şifrə-bərpa məktubları |
| Fayl anbarı | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | Cloudflare R2 — şəkil/sənəd yükləmə |

`.env` git-ə düşmür (`.gitignore`-a bax).

---

## Səhifələr

Route-lar iki qrupa bölünüb: `app/(site)/` publik sayt (üst panel + altlıq),
`app/admin/` isə idarə paneli (öz sidebar bəzəyi ilə). Kök `app/layout.tsx`
yalnız `<html>/<body>` və şriftləri saxlayır.

| Route | Nə göstərir | Fayl |
|---|---|---|
| `/` | Ana səhifə | `app/(site)/page.tsx` |
| `/meqaleler` | Bloq kataloqu (filtr, axtarış, videolar, protokollar) | `app/(site)/meqaleler/page.tsx` |
| `/meqaleler/[slug]` | Məqalə detallı oxu + şərhlər | `app/(site)/meqaleler/[slug]/page.tsx` |
| `/videolar/[id]` | Video detal səhifəsi | `app/(site)/videolar/[id]/page.tsx` |
| `/haqqinda` | Həkim haqqında | `app/(site)/haqqinda/page.tsx` |
| `/elaqe` | Əlaqə (kanallar, klinika, FAQ, forma) | `app/(site)/elaqe/page.tsx` |
| `/abunelik/cixis` | Bülletendən çıxış linki | `app/(site)/abunelik/cixis/page.tsx` |
| `/media/[...key]` | R2-dəki fayllara proksi (bucket publik olmayanda) | `app/media/[...key]/route.ts` |

## İdarə paneli

Giriş: **`/admin/login`**

Seed-lə yaradılan hesablar (`prisma/seed.ts`):

| E-poçt | Şifrə | Rol |
|---|---|---|
| `admin@drnarmin.az` | `Admin123!` | Administrator |
| `redaktor@drnarmin.az` | `Redaktor123!` | Redaktor |

### Modullar

| Route | Nə edir |
|---|---|
| `/admin` | Statistika, ən çox oxunanlar, moderasiya və müraciət xülasəsi |
| `/admin/meqaleler` | Siyahı + filtr, status dəyişimi, silmə |
| `/admin/meqaleler/yeni`, `/[id]` | Zəngin (Tiptap əsaslı) blok redaktoru — şəkil, qalereya, slayd, video, sənəd, cədvəl |
| `/admin/kateqoriyalar` | Kateqoriya CRUD |
| `/admin/videolar` | CardioTalk videoları |
| `/admin/protokollar` | PDF protokolları |
| `/admin/serhler` | Şərh moderasiyası + həkim adından cavab |
| `/admin/muracietler` | Müraciət gələnlər qutusu |
| `/admin/abuneciler` | Bülleten abunəçiləri + xəbər məktubu göndərişi |
| `/admin/hekim` | Həkim profili (bio, timeline, tədqiqat, kanallar) |
| `/admin/elaqe` | Əlaqə kanalları, klinika qrafiki, FAQ |
| `/admin/parametrler` | Sayt kimliyi, funksiya açarları, açılış ekranı |
| `/admin/hesabim` | Öz hesabı — şifrə dəyişimi |

### Auth

- `middleware.ts` `/admin/*` route-larını qoruyur (Edge-də yalnız cookie-nin
  mövcudluğu/bitmə vaxtı yoxlanılır) və `/admin/login`-ə yönləndirir.
- Sessiya httpOnly cookie-də saxlanılır (`lib/auth/session.ts`).
- Real rejimdə (`NEXT_PUBLIC_USE_MOCK=false`) giriş `users` cədvəlinə qarşı
  aparılır, şifrələr `bcryptjs` ilə hash-lənir (`lib/api/auth.ts`).
- Şifrə bərpası: `/admin/sifre-berpa` → Gmail SMTP ilə 1 saat etibarlı link
  göndərir → `/admin/sifre-sifirla?token=...`. Poçt konfiqurasiya
  olunmayıbsa göndərmə səssizcə baş tutmur (`lib/mail/index.ts`).
- Mock rejimdə giriş `lib/auth/mock-users.ts` üzərində yoxlanılır, amma
  şifrə dəyişimi/bərpası işləmir (bazasız məntiqi yoxdur).

### Data qatı

`lib/api/*` — komponentlərin yeganə data mənbəyi. Hər funksiya
`NEXT_PUBLIC_USE_MOCK`-a görə iki yoldan birini seçir:

- **`false` (əsas rejim)** → `lib/db/*` vasitəsilə Prisma/PostgreSQL-ə sorğu.
  Bağlantı xətaları `lib/api/safe.ts`-dəki `safeDb()` ilə tutulur ki, build
  zamanı baza əlçatan olmasa da səhifə boş fallback-la qurulsun, işlək
  saytda isə bir sorğunun uğursuzluğu bütün səhifəni 500-ə çevirməsin.
- **`true` (mock rejim)** → `lib/mock/store.ts`-dəki **in-memory** anbardan.
  Data prosesin yaddaşındadır, `npm run dev` yenidən başlayanda sıfırlanır;
  baza qurmadan UI-ı sınamaq üçün faydalıdır.

Layout mobil-öncəlikli, `lg` breakpoint-dən sonra desktop grid-ə keçir: üst
naviqasiya + altlıq görünür, mobil alt naviqasiya gizlənir.

---

## Məqalə redaktoru

Redaktor Tiptap əsaslı WYSIWYG kanvasdır (`components/admin/canvas/`):
şəkil, qalereya, slayder, video, fayl (sənəd) və ölçülənə bilən media
blokları sürüklə-burax ilə əlavə olunur. Bazada isə mətn HTML kimi yox,
struktur bloklar massivi kimi saxlanılır (`Article.blocks: Json`,
tipi `ArticleBlock[]` — `lib/types.ts`); sətiriçi formatlaşdırma (qalın,
rəng, ölçü) BB kod kimi kodlanır. `lib/editor/document.ts` bu iki format
arasında (`ArticleBlock[]` ⇄ redaktorun HTML sənədi) çevirməni aparır,
`lib/bbcode/` isə BB kodu HTML-ə render edir.

---

## Fayl anbarı (şəkil/sənəd yükləmə)

Yeganə dəstəklənən anbar **Cloudflare R2**-dir (`lib/admin/storage/`).
`.env`-də R2 dəyişənləri boş buraxılsa yükləmə baş tutmur (bax
`storageStatus()`) — `public/` qovluğuna yazmaq qəsdən yoxdur, çünki bu
qovluq build artefaktının bir hissəsidir və yayımda hər deploy-da silinir.

- `R2_PUBLIC_URL` verilibsə şəkillər birbaşa Cloudflare-dən yüklənir
  (`next.config.ts`-dəki `images.remotePatterns`).
- Verilməyibsə fayllar `/media/[...key]` marşrutu (`app/media/[...key]/route.ts`)
  vasitəsilə serverin öz R2 açarları ilə oxunub ötürülür.

---

## Qovluq strukturu

```
app/
  (site)/               # Publik sayt route-ları (server komponentlər)
  admin/(panel)/         # İdarə paneli route-ları
  admin/login, sifre-*/   # Auth səhifələri (panel layout-undan kənar)
  media/[...key]/         # R2 fayl proksisi
components/
  ui/                   # Baza dizayn sistemi: Button, Card, Badge, Chip,
                        # Field, Accordion, Alert, SearchBar, SectionHeader,
                        # Icon, EmptyState, LoadingScreen
  layout/               # SiteHeader, BottomNav, SiteFooter, Container,
                        # PageShell, SearchDialog, SplashScreen
  home/, articles/, article/, doctor/, contact/  # Sayta xas bloklar
  admin/                # Panel UI: DataTable, ResourceManager, ArticleForm...
  admin/canvas/          # Tiptap əsaslı məqalə redaktoru (node view-lar)
lib/
  types.ts              # Bütün domen modelləri
  api/                  # Service qatı — komponentlər yalnız buradan data alır
  db/                   # Prisma sorğuları (real rejim)
  mock/                 # In-memory mock data (mock rejim)
  auth/                 # Sessiya, tiplər, mock istifadəçilər
  admin/                # Admin sorğuları, storage, media köməkçiləri
  editor/, bbcode/       # Redaktor ⇄ saxlama format çevirmələri
  mail/                  # Gmail SMTP + məktub şablonları
  site.ts               # Naviqasiya və sayt konfiqurasiyası
  settings.ts             # Sayt parametrlərinin sxemi və defolt dəyərləri
  utils.ts               # cn(), formatNumber()
prisma/
  schema.prisma          # PostgreSQL sxemi
  seed.ts                 # Nümunə data + admin/redaktor hesabları
public/images/            # SVG placeholder şəkillər
```

### Komponent prinsipləri

- Hər komponent `export interface XProps` ilə tipləndirilib.
- Vizual variantlar `variant` prop-u ilə idarə olunur
  (`ArticleCard`: `featured | compact | list`; `Button`: `primary | secondary | ghost | tonal`).
- `"use client"` yalnız interaktiv komponentlərdə (filtr, forma, akkordeon,
  oxunma tərəqqisi, redaktor). Səhifələr server komponentdir.

---

## Dizayn token-ləri

Bütün token-lər `app/globals.css` faylında Tailwind v4 `@theme` bloku kimi
təyin olunub və birbaşa utility class kimi işlədilir:

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

## Docker ilə işə salma

```bash
docker compose up -d --build   # tətbiq + yerli PostgreSQL
docker compose logs -f web     # gündəlikləri izləmək
docker compose down             # dayandırmaq
```

- Gizli açarlar `docker-compose.yml`-də deyil, kök qovluqdakı `.env`
  faylından oxunur (`.env.example`-ə bax).
- `Dockerfile` çoxmərhələlidir: `deps` → `builder` (`prisma generate` +
  `next build`, `output: "standalone"`) → `runner` (root olmayan istifadəçi,
  yalnız `.next/standalone` + `public` + `prisma`). Prisma-nın ikili
  faylları üçün glibc əsaslı `node:22-bookworm-slim` işlədilir (Alpine yox).
- Yayımda kənar PostgreSQL istifadə edəcəksinizsə, `docker-compose.yml`-dəki
  `db` xidmətini və `depends_on` sətrini silin.

---

## Şəkillər

`public/images/` içindəki SVG-lər müvəqqəti placeholder-lərdir (həkim
avatarı/portreti kimi seed-də istinad olunan statik fayllar). Real
məqalə/media şəkilləri admin paneldən yüklənir və Cloudflare R2-də saxlanılır
(yuxarıdakı **Fayl anbarı** bölməsinə bax).
