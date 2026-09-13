"use server";

import { revalidatePath } from "next/cache";
import { revalidateSitePath } from "@/lib/revalidate-site";
import type { ActionResult } from "@/lib/admin/types";
import { nextId, store, type CommentStatus } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { dbApproveComment, dbRejectComment, dbDeleteComment } from "@/lib/db/admin";
import { prisma } from "@/lib/prisma";
import { CommentStatus as PrismaCommentStatus } from "@prisma/client";

function refresh(slug?: string) {
  revalidatePath("/admin/serhler");
  revalidatePath("/admin");
  if (slug) revalidateSitePath(`/articles/${slug}`);
}

export async function setCommentStatus(
  id: string,
  status: CommentStatus,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      /* Məqalə səhifəsinin də yenilənməsi üçün slug əvvəlcədən oxunur —
       * status dəyişəndən sonra şərhin hansı məqaləyə aid olduğu lazımdır. */
      const target = await prisma.comment.findUnique({
        where: { id },
        select: { article: { select: { slug: true } } },
      });

      if (status === "approved") {
        await dbApproveComment(id);
      } else if (status === "rejected") {
        await dbRejectComment(id);
      }
      refresh(target?.article.slug);
      return { success: true };
    } catch (error) {
      console.error("Set comment status error:", error);
      return { success: false, message: "Şərh tapılmadı." };
    }
  }

  const comment = store.comments.find((c) => c.id === id);
  if (!comment) return { success: false, message: "Şərh tapılmadı." };
  comment.status = status;
  refresh(comment.articleSlug);
  return { success: true };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      const target = await prisma.comment.findUnique({
        where: { id },
        select: { article: { select: { slug: true } } },
      });
      await dbDeleteComment(id);
      refresh(target?.article.slug);
      return { success: true };
    } catch (error) {
      console.error("Delete comment error:", error);
      return { success: false, message: "Şərh tapılmadı." };
    }
  }

  const index = store.comments.findIndex((c) => c.id === id);
  if (index === -1) return { success: false, message: "Şərh tapılmadı." };
  const [removed] = store.comments.splice(index, 1);
  // Cavabları da silinir
  store.comments = store.comments.filter((c) => c.parentId !== id);
  refresh(removed.articleSlug);
  return { success: true };
}

/**
 * Həkim adından cavab yazır — dərhal təsdiqlənmiş sayılır.
 *
 * Ana şərh hələ "gözləyir" statusundadırsa, o da bu əməliyyatla birlikdə
 * təsdiqlənir: admin ona cavab yazırsa, deməli artıq görüb və məzmununu
 * qəbul edir — əks halda cavab saytda görünərdi, amma hələ təsdiqlənməmiş
 * ana şərh gizli qaldığı üçün cavab "asılı qalıb" heç yerdə çıxmazdı.
 */
export async function replyToComment(
  parentId: string,
  body: string,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        include: { article: { select: { slug: true } } },
      });
      if (!parent) return { success: false, message: "Şərh tapılmadı." };
      if (!body.trim()) return { success: false, message: "Cavab mətni boşdur." };

      const doctor = await prisma.doctorProfile.findFirst();

      await prisma.$transaction([
        ...(parent.status !== PrismaCommentStatus.APPROVED
          ? [
              prisma.comment.update({
                where: { id: parentId },
                data: { status: PrismaCommentStatus.APPROVED },
              }),
            ]
          : []),
        prisma.comment.create({
          data: {
            parentId,
            articleId: parent.articleId,
            authorName: doctor?.fullName || "Həkim",
            authorRole: "Müəllif",
            authorAvatarUrl: doctor?.avatarUrl,
            isAuthorVerified: true,
            isDoctorReply: true,
            body: body.trim(),
            status: PrismaCommentStatus.APPROVED,
          },
        }),
      ]);

      refresh(parent.article.slug);
      return { success: true, message: "Cavab əlavə olundu." };
    } catch (error) {
      console.error("Reply to comment error:", error);
      return { success: false, message: "Xəta baş verdi." };
    }
  }

  const parent = store.comments.find((c) => c.id === parentId);
  if (!parent) return { success: false, message: "Şərh tapılmadı." };
  if (!body.trim()) return { success: false, message: "Cavab mətni boşdur." };

  parent.status = "approved";

  store.comments.push({
    id: nextId("cm"),
    parentId,
    articleSlug: parent.articleSlug,
    articleTitle: parent.articleTitle,
    authorName: store.doctor.fullName,
    authorInitials: "NƏ",
    authorRole: "Müəllif",
    authorAvatarUrl: store.doctor.avatarUrl,
    isAuthorVerified: true,
    isDoctorReply: true,
    createdAtLabel: new Date().toLocaleString("az-AZ"),
    body: body.trim(),
    likeCount: 0,
    status: "approved",
  });

  refresh(parent.articleSlug);
  return { success: true, message: "Cavab əlavə olundu." };
}
