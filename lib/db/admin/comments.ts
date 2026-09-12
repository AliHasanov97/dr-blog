import { prisma } from "@/lib/prisma";
import { CommentStatus } from "@prisma/client";

export async function dbListComments() {
  const comments = await prisma.comment.findMany({
    include: {
      article: { select: { slug: true, title: true } },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return comments.map((c) => ({
    id: c.id,
    articleSlug: c.article.slug,
    articleTitle: c.article.title,
    authorName: c.authorName,
    authorInitials: c.authorName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    authorRole: c.authorRole,
    authorAvatarUrl: c.authorAvatarUrl,
    isAuthorVerified: c.isAuthorVerified,
    isDoctorReply: c.isDoctorReply,
    createdAtLabel: new Intl.DateTimeFormat("az", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(c.createdAt),
    body: c.body,
    likeCount: c.likeCount,
    status: c.status.toLowerCase() as "pending" | "approved" | "rejected",
    parentId: c.parentId,
  }));
}

export async function dbApproveComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { status: CommentStatus.APPROVED },
  });
}

export async function dbRejectComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { status: CommentStatus.REJECTED },
  });
}

export async function dbDeleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}
