# syntax=docker/dockerfile:1

# ---------------------------------------------------------------
# DR Blog — Next.js tetbiqi ucun coxmerheleli qurulus
#
# Merheleler ayri saxlanilir ki, son image-de yalniz ise lazim olan
# fayllar qalsin: qurulus aletleri, dev bagimliliqlari ve menbe kodu
# icinde olmur.
#
# Qurmaq:  docker build -t dr-blog .
# Islatmek: docker run -p 3000:3000 --env-file .env dr-blog
# ---------------------------------------------------------------

# Prisma-nin hazir ikili fayllari ucun glibc esasli obraz lazimdir;
# Alpine (musl) ile elave konfiqurasiya teleb olunur.
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# --- Bagimliliqlar -------------------------------------------------
# Ayrica merhele: package fayllari deyismeyibse Docker bu qati kesden
# goturur ve `npm ci` yeniden islemir.
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# --- Qurulus -------------------------------------------------------
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma klienti sxemden yaradilir (bazaya baglanti teleb etmir).
RUN npx prisma generate

# NEXT_PUBLIC_* deyerleri qurulus zamani koda yazilir, ona gore
# build arqumenti kimi verilir. Gizli acarlar burada DEYIL — onlar
# ise vaxti ötürülür.
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ENABLED_LOCALES=""
ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ENABLED_LOCALES=$NEXT_PUBLIC_ENABLED_LOCALES

RUN npm run build

# --- Isleme --------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Tetbiq root altinda islemir — konteynerde standart tehlukesizlik teleb.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# `standalone` cixisi ise lazim olan node_modules-u ozu daşiyir.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma sxemi ve klienti — miqrasiya emrleri ucun lazimdir.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# Konteynerin sagligini yoxlayir — orkestrator bunu izleyir.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
