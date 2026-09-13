"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, Card, Icon, TextAreaField, TextField } from "@/components/ui";
import { submitComment } from "@/app/[locale]/(site)/articles/[slug]/actions";
import { useCommentLike } from "./useCommentLike";
import type { Comment } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface CommentsSectionProps {
  slug: string;
  initialComments: Comment[];
  totalLabel?: string;
  className?: string;
}

type Feedback = { tone: "ok" | "error"; text: string } | null;

export function CommentsSection({
  slug,
  initialComments,
  totalLabel,
  className,
}: CommentsSectionProps) {
  const t = useTranslations("comments");
  /* Hansı şərhə cavab yazılır (null — yeni şərh) */
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  return (
    <section
      id="serhler"
      className={cn("flex flex-col gap-space-md scroll-mt-28", className)}
    >
      <div className="flex items-center justify-between gap-space-sm">
        <span className="flex items-center gap-space-xs">
          <Icon name="forum" size={22} className="text-secondary" />
          <h2 className="font-headline text-headline-md text-on-surface">
            {t("sectionTitle")}
          </h2>
        </span>
        <span className="font-label text-label-sm text-outline shrink-0">
          {totalLabel ?? t("count", { count: initialComments.length })}
        </span>
      </div>

      <CommentForm
        slug={slug}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      <div className="flex flex-col gap-space-md">
        {initialComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={setReplyTo}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------
 * Şərh forması
 * ------------------------------------------------------------ */

function CommentForm({
  slug,
  replyTo,
  onCancelReply,
}: {
  slug: string;
  replyTo: Comment | null;
  onCancelReply: () => void;
}) {
  const t = useTranslations("comments");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [draftError, setDraftError] = useState<string | undefined>();

  async function handleSubmit() {
    setFeedback(null);
    setNameError(undefined);
    setEmailError(undefined);
    setDraftError(undefined);

    /* Serverdəki eyni qaydalar — sahə göndərilmədən əvvəl birbaşa qırmızılaşır */
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setNameError(t("errorNameShort"));
      return;
    }
    if (trimmedName.length > 80) {
      setNameError(t("errorNameLong"));
      return;
    }
    if (draft.trim().length < 10) {
      setDraftError(t("errorBodyShort"));
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError(t("errorEmail"));
      return;
    }

    setSending(true);
    try {
      const result = await submitComment({
        slug,
        body: draft,
        authorName: name,
        authorEmail: email,
        parentId: replyTo?.id,
      });
      setFeedback({
        tone: result.success ? "ok" : "error",
        text: result.message,
      });
      if (result.success) {
        /* Şərh moderasiyadadır — siyahıya əlavə edilmir, çünki hələ
         * dərc olunmayıb. Səhifə yenilənəndə itməsi çaşdırıcı olardı. */
        setDraft("");
        onCancelReply();
      }
    } catch {
      setFeedback({
        tone: "error",
        text: t("submitNetworkError"),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex flex-col gap-space-sm">
      {replyTo && (
        <div className="flex items-center justify-between gap-space-xs rounded-md bg-secondary/[0.08] px-space-sm py-space-xs">
          <span className="flex items-center gap-1 font-label text-label-sm text-secondary min-w-0">
            <Icon name="reply" size={15} className="shrink-0" />
            <span className="truncate">
              {t("replyingTo", { name: replyTo.authorName })}
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 inline-flex items-center font-label text-label-sm text-outline hover:text-on-surface transition-colors"
          >
            <Icon name="close" size={16} />
            <span className="sr-only">{t("cancelReply")}</span>
          </button>
        </div>
      )}

      <div className="grid gap-space-xs sm:grid-cols-2">
        <TextField
          label={t("nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          error={nameError}
        />
        <TextField
          label={t("emailLabel")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          type="email"
          autoComplete="email"
          error={emailError}
        />
      </div>

      <TextAreaField
        label={t("bodyLabel")}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setDraftError(undefined);
        }}
        rows={3}
        maxLength={2000}
        placeholder={replyTo ? t("replyPlaceholder") : t("bodyPlaceholder")}
        error={draftError}
      />

      {feedback && (
        <p
          role="status"
          className={cn(
            "flex items-start gap-1 font-label text-label-sm",
            feedback.tone === "ok" ? "text-secondary" : "text-error",
          )}
        >
          <Icon
            name={feedback.tone === "ok" ? "check_circle" : "error"}
            size={15}
            className="mt-0.5 shrink-0"
          />
          {feedback.text}
        </p>
      )}

      <div className="flex items-center justify-between gap-space-sm flex-wrap">
        <span className="flex items-center gap-1 font-label text-label-sm text-outline">
          <Icon name="security" size={14} />
          {t("moderationNotice")}
        </span>
        <Button
          type="button"
          size="sm"
          icon="send"
          disabled={sending}
          onClick={handleSubmit}
        >
          {sending ? t("sending") : replyTo ? t("submitReply") : t("submitComment")}
        </Button>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------
 * Şərh kartı
 * ------------------------------------------------------------ */

function CommentItem({
  comment,
  isReply = false,
  onReply,
}: {
  comment: Comment;
  isReply?: boolean;
  onReply?: (comment: Comment) => void;
}) {
  const t = useTranslations("comments");
  const { liked, count, toggle } = useCommentLike(comment.id, comment.likeCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-space-xs",
        isReply && "ms-space-lg ps-space-md border-s-2 border-secondary/30",
      )}
    >
      <Card
        className={cn(
          "flex flex-col gap-space-xs",
          comment.isDoctorReply && "bg-secondary/[0.06] border-secondary/25",
        )}
      >
        <div className="flex items-start gap-space-sm">
          {comment.authorAvatarUrl ? (
            <Image
              src={comment.authorAvatarUrl}
              alt={comment.authorName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-secondary/30"
            />
          ) : (
            <span className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center font-label text-label-lg text-on-surface-variant">
              {comment.authorInitials}
            </span>
          )}

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="flex items-center gap-space-2xs flex-wrap">
              <span className="font-label text-label-lg text-on-surface">
                {comment.authorName}
              </span>
              {comment.isAuthorVerified && (
                <Icon name="verified" size={14} className="text-secondary" filled />
              )}
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high font-label text-label-sm text-on-surface-variant">
                {comment.authorRole}
              </span>
            </span>
            <span className="font-label text-label-sm text-outline">
              {comment.createdAtLabel}
            </span>
          </div>
        </div>

        <p className="font-body text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
          {comment.body}
        </p>

        <div className="flex items-center gap-space-md pt-space-2xs">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={liked}
            className={cn(
              "inline-flex items-center gap-1 font-label text-label-sm transition-colors",
              liked ? "text-secondary" : "text-outline hover:text-on-surface",
            )}
          >
            <Icon name="thumb_up" size={15} filled={liked} />
            {count}
          </button>
          {/* Cavab yalnız kök şərhlərə yazılır — iyerarxiya bir səviyyəlidir */}
          {!isReply && onReply && (
            <button
              type="button"
              onClick={() => {
                onReply(comment);
                document
                  .getElementById("serhler")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-1 font-label text-label-sm text-outline hover:text-on-surface transition-colors"
            >
              <Icon name="reply" size={15} />
              {t("replyCta")}
            </button>
          )}
        </div>
      </Card>

      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );
}
