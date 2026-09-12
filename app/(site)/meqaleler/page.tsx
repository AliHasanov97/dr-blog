import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import {
  getArticles,
  getCategories,
  getFeaturedArticle,
  getProtocols,
  getTopReadArticles,
  getVideos,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Bloq və Elmi Məqalələr",
  description:
    "Kardiologiya üzrə klinik icmallar, meta-təhlillər və pasiyentlər üçün sübuta əsaslanan bələdçilər.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  const settings = await getSiteSettings();

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
          <SectionHeader title="Ayın Təhlili" icon="stars" />
          <Card padded={false} interactive className="overflow-hidden">
            <Link href={`/meqaleler/${featured.slug}`} className="lg:flex">
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
                    Rəy verilib
                  </Badge>
                </div>
              </div>

              <div className="p-card-padding lg:p-space-xl flex flex-col gap-space-xs justify-center">
                <Badge tone="tertiary" icon="auto_awesome">
                  Ekspert Təhlili
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
                    {featured.viewCount?.toLocaleString("az-AZ")}
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
          title="Ən Çox Oxunanlar"
          icon="trending_up"
          size="sm"
          hint="Top 5 İcmal"
        />
        <TopReadList items={topRead} />
      </section>

      {/* Video bölməsi */}
      <section className="flex flex-col gap-space-sm">
        <SectionHeader
          title="CardioTalk: Video İzahlar & Vebinarlar"
          icon="smart_display"
          size="sm"
          hint={`${videos.length} Video İzah`}
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
          title="Klinik Protokollar & Təlimatlar"
          icon="verified"
          size="sm"
          hint="Həkimlər üçün PDF"
        />
        <ProtocolList documents={protocols} />
      </section>

      {settings.newsletterEnabled && <NewsletterCard />}
    </PageShell>
  );
}
