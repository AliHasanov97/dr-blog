"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ConfirmButton, StatusPill } from "@/components/admin";
import { Button, Chip, Icon, TextAreaField } from "@/components/ui";
import { commentStatusLabels } from "@/lib/admin/format";
import type { AdminComment, CommentStatus } from "@/lib/mock/store";
import { deleteComment, replyToComment, setCommentStatus } from "./actions";
import { cn } from "@/lib/utils";

export interface CommentModerationClientProps {
  comments: AdminComment[];
}

const filters: { slug: CommentStatus | "all"; name: string; icon: string }[] = [
  { slug: "pending", name: "Gözləyir", icon: "schedule" },
  { slug: "approved", name: "Təsdiqlənib", icon: "check_circle" },
  { slug: "rejected", name: "Rədd edilib", icon: "block" },
  { slug: "all", name: "Hamısı", icon: "apps" },
];

const tone = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
} as const;

interface ArticleGroup {
  articleSlug: string;
  articleTitle: string;
  count: number;
  /** Ana şərhlər (yaxud ana şərhi bu filtrdə görünməyən "yetim" cavablar) */
  topLevel: AdminComment[];
  /** Ana şərhin id-sinə görə onun cavabları — oxucu tərəfindəki kimi girintili göstərilir */
  repliesByParent: Map<string, AdminComment[]>;
}

export function CommentModerationClient({ comments }: CommentModerationClientProps) {
  const [filter, setFilter] = useState<CommentStatus | "all">("pending");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () =>
      filter === "all" ? comments : comments.filter((c) => c.status === filter),
    [comments, filter],
  );

  /*
   * Fərqli məqalələrin şərhləri bir-birinə qarışmasın deyə məqaləyə görə
   * qruplaşdırılır — hər məqalənin öz başlığı altında öz şərhləri gəlir.
   * Qrup daxilində isə cavablar oxucu tərəfindəki kimi öz ana şərhinin altında
   * girintili göstərilir (bağlayıcı xətt ilə) — ana şərh eyni filtrdə
   * görünmürsə (məs. statusları fərqlidirsə), cavab "yetim" kimi ayrıca kart
   * olaraq, üzərində hansı şərhə aid olduğunu göstərən sitat qutusu ilə çıxır.
   */
  const groups = useMemo<ArticleGroup[]>(() => {
    const map = new Map<string, ArticleGroup>();
    for (const c of visible) {
      if (!map.has(c.articleSlug)) {
        map.set(c.articleSlug, {
          articleSlug: c.articleSlug,
          articleTitle: c.articleTitle,
          count: 0,
          topLevel: [],
          repliesByParent: new Map(),
        });
      }
    }
    const idSet = new Set(visible.map((c) => c.id));
    for (const c of visible) {
      const group = map.get(c.articleSlug)!;
      group.count += 1;
      if (c.parentId && idSet.has(c.parentId)) {
        const siblings = group.repliesByParent.get(c.parentId) ?? [];
        siblings.push(c);
        group.repliesByParent.set(c.parentId, siblings);
      } else {
        group.topLevel.push(c);
      }
    }
    return [...map.values()];
  }, [visible]);

  function act(id: string, status: CommentStatus) {
    startTransition(() => {
      void setCommentStatus(id, status);
    });
  }

  function submitReply(parentId: string) {
    startTransition(async () => {
      const result = await replyToComment(parentId, replyText);
      if (result.success) {
        setReplyTo(null);
        setReplyText("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center gap-space-xs overflow-x-auto scrollbar-none">
        {filters.map((f) => (
          <Chip
            key={f.slug}
            label={f.name}
            icon={f.icon}
            active={filter === f.slug}
            count={
              f.slug === "all"
                ? comments.length
                : comments.filter((c) => c.status === f.slug).length
            }
            onClick={() => setFilter(f.slug)}
          />
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant py-space-2xl text-center">
          <Icon name="forum" size={34} className="text-outline" />
          <p className="mt-space-2xs font-body text-body-sm text-on-surface-variant">
            Bu filtrə uyğun şərh yoxdur.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {groups.map((group) => (
            <section key={group.articleSlug} className="flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs px-space-2xs">
                <Link
                  href={`/articles/${group.articleSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 min-w-0 font-label text-label-lg text-on-surface hover:text-secondary"
                >
                  <Icon name="article" size={16} className="shrink-0 text-secondary" />
                  <span className="truncate">{group.articleTitle}</span>
                </Link>
                <span className="shrink-0 font-label text-label-sm text-outline">
                  {group.count} şərh
                </span>
              </div>

              <div className="flex flex-col gap-space-sm">
                {group.topLevel.map((comment) => (
                  <div key={comment.id} className="flex flex-col gap-space-sm">
                    <CommentCard
                      comment={comment}
                      showParentContext
                      pending={pending}
                      replyOpen={replyTo === comment.id}
                      replyText={replyText}
                      onAct={act}
                      onToggleReply={() => {
                        setReplyTo(replyTo === comment.id ? null : comment.id);
                        setReplyText("");
                      }}
                      onReplyTextChange={setReplyText}
                      onCancelReply={() => setReplyTo(null)}
                      onSubmitReply={() => submitReply(comment.id)}
                    />
                    {group.repliesByParent.get(comment.id)?.map((reply) => (
                      <div
                        key={reply.id}
                        className="ms-space-lg ps-space-md border-s-2 border-secondary/30"
                      >
                        <CommentCard
                          comment={reply}
                          showParentContext={false}
                          pending={pending}
                          replyOpen={replyTo === reply.id}
                          replyText={replyText}
                          onAct={act}
                          onToggleReply={() => {
                            setReplyTo(replyTo === reply.id ? null : reply.id);
                            setReplyText("");
                          }}
                          onReplyTextChange={setReplyText}
                          onCancelReply={() => setReplyTo(null)}
                          onSubmitReply={() => submitReply(reply.id)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentCard({
  comment,
  showParentContext,
  pending,
  replyOpen,
  replyText,
  onAct,
  onToggleReply,
  onReplyTextChange,
  onCancelReply,
  onSubmitReply,
}: {
  comment: AdminComment;
  /** Şərh cavabdırsa və ana şərhi öz valideyninin altında girintili göstərilmirsə (yetim haldır), sitat qutusu göstərilir */
  showParentContext: boolean;
  pending: boolean;
  replyOpen: boolean;
  replyText: string;
  onAct: (id: string, status: CommentStatus) => void;
  onToggleReply: () => void;
  onReplyTextChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface-container-lowest shadow-level-1 p-space-md flex flex-col gap-space-sm",
        comment.status === "pending"
          ? "border-tertiary-fixed-dim/60"
          : "border-surface-container",
      )}
    >
      <div className="flex items-start gap-space-sm">
        <span
          className={cn(
            "w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-label text-label-md",
            comment.isDoctorReply
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container-high text-on-surface-variant",
          )}
        >
          {comment.authorInitials}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label text-label-lg text-on-surface">
              {comment.authorName}
            </span>
            <span className="font-label text-label-sm text-outline">
              {comment.authorRole} • {comment.createdAtLabel}
            </span>
            {showParentContext && comment.parentId && (
              <StatusPill label="Cavab" tone="info" icon="reply" />
            )}
          </span>
        </div>
        <StatusPill
          label={commentStatusLabels[comment.status]}
          tone={tone[comment.status]}
        />
      </div>

      {showParentContext && comment.parentId && (
        <div className="flex items-start gap-1.5 rounded-md bg-surface-container-low px-space-sm py-space-xs">
          <Icon
            name="subdirectory_arrow_right"
            size={15}
            className="text-outline mt-0.5 shrink-0"
          />
          <span className="font-label text-label-sm text-on-surface-variant min-w-0">
            <span className="font-semibold text-on-surface">
              {comment.parentAuthorName ?? "silinmiş şərh"}
            </span>{" "}
            şərhinə cavab
            {comment.parentBody && (
              <>
                :{" "}
                <span className="italic">
                  «
                  {comment.parentBody.length > 90
                    ? `${comment.parentBody.slice(0, 90)}…`
                    : comment.parentBody}
                  »
                </span>
              </>
            )}
          </span>
        </div>
      )}

      <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
        {comment.body}
      </p>

      <div className="flex flex-wrap items-center gap-space-xs pt-space-2xs border-t border-surface-container">
        {comment.status !== "approved" && (
          <Button
            size="sm"
            variant="tonal"
            icon="check"
            disabled={pending}
            onClick={() => onAct(comment.id, "approved")}
          >
            Təsdiqlə
          </Button>
        )}
        {comment.status !== "rejected" && (
          <Button
            size="sm"
            variant="secondary"
            icon="block"
            disabled={pending}
            onClick={() => onAct(comment.id, "rejected")}
          >
            Rədd et
          </Button>
        )}
        {!comment.parentId && (
          <Button size="sm" variant="ghost" icon="reply" onClick={onToggleReply}>
            Cavab yaz
          </Button>
        )}
        <ConfirmButton
          onConfirm={() => deleteComment(comment.id)}
          className="ms-auto"
          label="Sil"
          itemName={`${comment.authorName}: ${comment.body.slice(0, 60)}…`}
          question="Bu şərhi silmək istəyirsiniz?"
        />
      </div>

      {replyOpen && (
        <div className="flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
          {comment.status === "pending" && (
            <p className="flex items-start gap-1 font-label text-label-sm text-on-tertiary-container">
              <Icon name="info" size={14} className="mt-0.5 shrink-0" />
              Bu şərh hələ gözləyir — cavab yazsanız, şərh də bu cavabla
              birlikdə avtomatik təsdiqlənib saytda görünəcək.
            </p>
          )}
          <TextAreaField
            label="Cavabınız"
            hint="Sizin adınızdan dərc olunacaq"
            rows={3}
            placeholder="Salam, sualınız üçün təşəkkür edirəm..."
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
          />
          <div className="flex items-center justify-end gap-space-xs">
            <Button size="sm" variant="secondary" onClick={onCancelReply}>
              Ləğv et
            </Button>
            <Button
              size="sm"
              icon="send"
              disabled={pending || !replyText.trim()}
              onClick={onSubmitReply}
            >
              Göndər
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
