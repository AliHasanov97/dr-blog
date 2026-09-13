import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout";
import {
  ArticleExplorer,
  HorizontalScroller,
  NewsletterCard,
  ProtocolList,
  TopReadList,
  VideoCard,
} from "@/components/articles";
import { Badge, Card, Icon, SectionHeader } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import {
  getArticles,
  getCategories,
  getFeaturedArticle,
  getProtocols,
  getTopReadArticles,
  getVideos,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("articles");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ArticlesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ q }, settings, t] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getTranslations("articles"),
  ]);

  /* Əsas məqalə siyahıdan kənarlaşdırılır — əvvəlcə onu tapmaq lazımdır */
  const featured = await getFeaturedArticle();

  const [articlesPage, categories, topRead, videos, protocols] =
    await Promise.all([
      /* Siyahının uzunluğu admin panelindəki «Səhifə başına məqalə»
       * parametrindən gəlir. */
      getArticles({
        pageSize: settings.articlesPerPage,
        excludeSlug: featured?.slug,
      }),
      getCategories(),
      getTopReadArticles(),
      getVideos(),
      getProtocols(),
    ]);

  return (
    <PageShell className="flex flex-col gap-space-xl lg:gap-space-2xl">
      {/* Ayın əsas məqaləsi */}
      {featured && (
        <section className="flex flex-col gap-space-sm">
          <SectionHeader title={t("monthlyAnalysis")} icon="stars" />
          <Card padded={false} interactive className="overflow-hidden">
            <Link href={`/articles/${featured.slug}`} className="lg:flex">
              <div className="relative w-full h-52 lg:h-auto lg:w-1/2 shrink-0 overflow-hidden">
                {featured.coverImageUrl && (
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container/45 via-transparent to-primary-container/25" />
                <div className="absolute top-space-sm inset-x-space-sm flex items-start">
                  <Badge tone="solid" icon="verified">
                    {t("reviewed")}
                  </Badge>
                </div>
              </div>

              <div className="p-card-padding lg:p-space-xl flex flex-col gap-space-xs justify-center">
                <Badge tone="tertiary" icon="auto_awesome">
                  {t("expertAnalysis")}
                </Badge>
                <h2 className="font-headline text-headline-lg-mobile lg:text-headline-lg text-on-surface leading-snug">
                  {featured.title}
                </h2>
                <p className="font-body text-body-sm lg:text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>

                <div className="pt-space-xs flex items-center gap-space-md font-label text-label-sm text-outline">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="visibility" size={14} />
                    {featured.viewCount?.toLocaleString(locale)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="menu_book" size={14} />
                    {featured.referenceLabel}
                  </span>
                </div>
              </div>
            </Link>
          </Card>
        </section>
      )}

      {/* Ən çox oxunanlar */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("mostRead")}
          icon="trending_up"
          size="sm"
          hint={t("top5Review")}
        />
        <TopReadList items={topRead} />
      </section>

      {/* Video bölməsi */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("videoSectionTitle")}
          icon="smart_display"
          size="sm"
          hint={t("videoCountHint", { count: videos.length })}
        />
        <HorizontalScroller desktopGridCols={2}>
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              className="w-[82vw] max-w-sm shrink-0 lg:w-auto lg:max-w-none"
            />
          ))}
        </HorizontalScroller>
      </section>

      {/* Məqalə kataloqu */}
      <ArticleExplorer
        key={q ?? ""}
        articles={articlesPage.items}
        total={articlesPage.total}
        pageSize={settings.articlesPerPage}
        categories={categories}
        featuredSlug={featured?.slug}
        initialQuery={q ?? ""}
      />

      {/* Protokollar */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title={t("protocolsTitle")}
          icon="verified"
          size="sm"
          hint={t("protocolsHint")}
        />
        <ProtocolList documents={protocols} />
      </section>

      {settings.newsletterEnabled && <NewsletterCard />}
    </PageShell>
  );
}
