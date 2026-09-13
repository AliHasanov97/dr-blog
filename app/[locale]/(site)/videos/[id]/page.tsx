import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout";
import { ArticleVideo } from "@/components/article";
import { Badge, ButtonLink, Icon } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getVideoById } from "@/lib/api";
import { extractYouTubeId } from "@/lib/youtube";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ id }, t] = await Promise.all([params, getTranslations("videos")]);
  const video = await getVideoById(id);
  if (!video) return { title: t("metaFallbackTitle") };
  return {
    title: video.title,
    description: video.description || undefined,
  };
}

export default async function VideoPage({ params }: PageProps) {
  const [{ id }, t, tNav] = await Promise.all([
    params,
    getTranslations("videos"),
    getTranslations("nav"),
  ]);
  const video = await getVideoById(id);
  if (!video) notFound();

  const youtubeId = extractYouTubeId(video.url);

  return (
    <PageShell className="flex flex-col gap-space-lg max-w-3xl">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1 font-label text-label-lg text-on-surface-variant hover:text-secondary transition-colors"
      >
        <Icon name="arrow_back" size={18} />
        {tNav("articlesShort")}
      </Link>

      <div className="flex flex-col gap-space-sm">
        {video.kindLabel && <Badge tone="secondary">{video.kindLabel}</Badge>}
        <h1 className="font-headline text-headline-lg-mobile lg:text-headline-lg text-on-surface leading-tight">
          {video.title}
        </h1>
      </div>

      {youtubeId ? (
        <ArticleVideo videoId={youtubeId} />
      ) : (
        <div className="rounded-xl border border-dashed border-outline-variant p-space-lg flex flex-col items-center gap-space-sm text-center">
          <Icon name="videocam_off" size={28} className="text-outline" />
          <p className="font-body text-body-sm text-on-surface-variant">
            {t("notAddedYet")}
          </p>
        </div>
      )}

      {video.description && (
        <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
          {video.description}
        </p>
      )}

      {youtubeId && (
        <ButtonLink
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          external
          variant="secondary"
          icon="open_in_new"
        >
          {t("openOnYoutube")}
        </ButtonLink>
      )}
    </PageShell>
  );
}
