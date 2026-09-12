import { prisma } from "@/lib/prisma";
import { ArticleStatus, CommentStatus, MessageStatus } from "@prisma/client";

export interface DashboardStats {
  published: number;
  drafts: number;
  pendingComments: number;
  newMessages: number;
  subscribers: number;
  totalViews: number;
}

export async function dbGetDashboardStats(): Promise<DashboardStats> {
  const [published, drafts, pendingComments, newMessages, subscribers, viewsResult] =
    await Promise.all([
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: { not: ArticleStatus.PUBLISHED } } }),
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.contactMessage.count({ where: { status: MessageStatus.NEW } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
    ]);

  return {
    published,
    drafts,
    pendingComments,
    newMessages,
    subscribers,
    totalViews: viewsResult._sum.viewCount ?? 0,
  };
}

export async function dbGetViewsByArticle(): Promise<{ label: string; value: number }[]> {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { viewCount: "desc" },
    take: 6,
    select: { title: true, viewCount: true },
  });

  return articles.map((a) => ({
    label: a.title.length > 34 ? `${a.title.slice(0, 34)}…` : a.title,
    value: a.viewCount,
  }));
}
