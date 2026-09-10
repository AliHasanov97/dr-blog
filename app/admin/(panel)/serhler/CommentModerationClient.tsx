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

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant py-space-2xl text-center">
          <Icon name="forum" size={34} className="text-outline" />
          <p className="mt-space-2xs font-body text-body-sm text-on-surface-variant">
            Bu filtrə uyğun şərh yoxdur.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {visible.map((comment) => (
            <li
              key={comment.id}
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
                    {comment.parentId && (
                      <StatusPill label="Cavab" tone="info" icon="reply" />
                    )}
                  </span>
                  <Link
                    href={`/meqaleler/${comment.articleSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-label text-label-sm text-secondary hover:underline truncate"
                  >
                    <Icon name="article" size={13} />
                    <span className="truncate">{comment.articleTitle}</span>
                  </Link>
                </div>
                <StatusPill
                  label={commentStatusLabels[comment.status]}
                  tone={tone[comment.status]}
                />
              </div>

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
                    onClick={() => act(comment.id, "approved")}
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
                    onClick={() => act(comment.id, "rejected")}
                  >
                    Rədd et
                  </Button>
                )}
                {!comment.parentId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="reply"
                    onClick={() => {
                      setReplyTo(replyTo === comment.id ? null : comment.id);
                      setReplyText("");
                    }}
                  >
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

              {replyTo === comment.id && (
                <div className="flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
                  <TextAreaField
                    label="Cavabınız"
                    hint="Sizin adınızdan dərc olunacaq"
                    rows={3}
                    placeholder="Salam, sualınız üçün təşəkkür edirəm..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-space-xs">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setReplyTo(null)}
                    >
                      Ləğv et
                    </Button>
                    <Button
                      size="sm"
                      icon="send"
                      disabled={pending || !replyText.trim()}
                      onClick={() => submitReply(comment.id)}
                    >
                      Göndər
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
