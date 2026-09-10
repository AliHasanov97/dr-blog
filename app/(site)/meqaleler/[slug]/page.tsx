import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout";
import {
  ArticleActionBar,
  ArticleBody,
  ArticleToc,
  CommentsSection,
  FeedbackBox,
  ReaderControls,
  ReadingProgress,
  ReferencesPanel,
  ShareCard,
  ArticleStats,
  ViewTracker,
} from "@/components/article";
import { ArticleCard } from "@/components/articles";
import { Badge, Card, Icon, SectionHeader } from "@/components/ui";
import { getSiteSettings } from "@/lib/admin/queries";
import {
  getArticleBySlug,
  getArticleSlugs,
  getComments,
  getRelatedArticles,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* Səhifə statik qurulur, amma baxış/bəyənmə sayğacları dəyişir —
 * bir dəqiqədən bir yenidən qurulur ki, statistika donub qalmasın. */
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Məqalə tapılmadı" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [comments, related, settings] = await Promise.all([
    getComments(slug),
    getRelatedArticles(slug),
    getSiteSettings(),
  ]);

  const commentsOpen =
    settings.commentsEnabled && article.allowComments !== false;

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={article.slug} />

      <main className="flex-1 pt-20 pb-40 lg:pb-space-2xl">
        <Container width="wide" className="py-space-lg">
          {/* Üst idarə lenti */}
          <div className="flex items-center justify-between gap-space-sm mb-space-md">
            <Link
              href="/meqaleler"
              className="inline-flex items-center gap-1 font-label text-label-lg text-on-surface-variant hover:text-secondary transition-colors"
            >
              <Icon name="arrow_back" size={18} />
              Məqalələr
            </Link>
            <ReaderControls />
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-space-xl xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-space-2xl">
            {/* --- Əsas sütun --- */}
            <article className="min-w-0 flex flex-col gap-space-lg">
              <header className="flex flex-col gap-space-sm">
                <div className="flex items-center flex-wrap gap-space-xs">
                  {article.badges?.map((badge) => (
                    <Badge
                      key={badge.label}
                      tone={badge.tone ?? "neutral"}
                      icon={badge.icon}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center flex-wrap gap-x-space-sm gap-y-1 font-label text-label-sm text-outline">
                  <span className="text-secondary font-semibold">
                    {article.category.name}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="schedule" size={14} />
                    {article.readMinutes} dəqiqə oxu
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>{article.publishedAtLabel}</span>
                </div>

                <h1 className="font-headline text-headline-lg-mobile lg:text-display text-on-surface leading-tight">
                  {article.title}
                </h1>

                {/* Müəllif təsdiq kartı */}
                <Card className="flex items-center gap-space-sm">
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.fullName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-tertiary-fixed-dim/40 shrink-0"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-center gap-1">
                      <span className="font-label text-label-lg text-on-surface truncate">
                        Tibb Elmləri Namizədi {article.author.fullName}
                      </span>
                      {article.author.isVerified && (
                        <Icon name="verified" size={15} className="text-secondary" filled />
                      )}
                    </span>
                    {article.verificationNote && (
                      <span className="flex items-center gap-1 font-label text-label-sm text-secondary">
                        <Icon name="check_circle" size={13} />
                        {article.verificationNote}
                      </span>
                    )}
                    {article.journalLabel && (
                      <span className="flex items-center gap-1 font-label text-label-sm text-outline">
                        <Icon name="menu_book" size={13} />
                        {article.journalLabel}
                      </span>
                    )}
                  </div>
                </Card>
              </header>

              {/* Hero şəkil */}
              {article.heroImageUrl && (
                <figure className="flex flex-col gap-space-xs">
                  <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] lg:max-h-[360px] rounded-xl overflow-hidden border border-surface-container">
                    <Image
                      src={article.heroImageUrl}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1440px) 1020px, (min-width: 1024px) 640px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {article.heroCaption && (
                    <figcaption className="font-label text-label-sm text-outline text-center">
                      {article.heroCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Mobil məzmun siyahısı — başlıqsız məqalədə göstərilmir */}
              {article.tableOfContents.length > 0 && (
                <div className="lg:hidden">
                  <ArticleToc items={article.tableOfContents} />
                </div>
              )}

              <ArticleBody blocks={article.blocks} />

              <ReferencesPanel references={article.references} />

              <ShareCard title={article.title} />

              <FeedbackBox slug={article.slug} articleTitle={article.title} />

              {/* Şərhlər həm bütün sayt üzrə, həm də bu məqalə üçün
                  ayrıca söndürülə bilər — ikisi də açıq olmalıdır */}
              {commentsOpen && (
                <CommentsSection
                  slug={article.slug}
                  initialComments={comments}
                  totalLabel={`${article.commentCount} rəy`}
                />
              )}
            </article>

            {/* --- Yan sütun (desktop) --- */}
            <aside className="hidden lg:flex flex-col gap-space-lg">
              <div className="sticky top-28 flex flex-col gap-space-lg">
                {article.tableOfContents.length > 0 && (
                  <ArticleToc items={article.tableOfContents} alwaysOpen />
                )}

                <Card className="flex flex-col gap-space-xs">
                  <span className="font-label text-label-md uppercase tracking-wider text-outline">
                    Statistika
                  </span>
                  <ArticleStats
                    slug={article.slug}
                    viewCount={article.viewCount ?? 0}
                    likeCount={article.likeCount}
                    commentCount={article.commentCount}
                  />
                </Card>

                {related.length > 0 && (
                  <div className="flex flex-col gap-space-sm">
                    <SectionHeader title="Oxşar məqalələr" icon="auto_stories" size="sm" />
                    {related.map((item) => (
                      <ArticleCard key={item.id} article={item} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Mobil oxşar məqalələr */}
          {related.length > 0 && (
            <section className="lg:hidden mt-space-xl flex flex-col gap-space-sm">
              <SectionHeader title="Oxşar məqalələr" icon="auto_stories" size="sm" />
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} variant="compact" />
              ))}
            </section>
          )}
        </Container>
      </main>

      <ArticleActionBar
        slug={article.slug}
        likeCount={article.likeCount}
        commentCount={article.commentCount}
        showComments={commentsOpen}
      />
    </>
  );
}

