"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Button, Card, Icon, TextAreaField, TextField } from "@/components/ui";
import {
  submitArticleQuestion,
  submitArticleReaction,
} from "@/app/[locale]/(site)/articles/[slug]/actions";
import { cn } from "@/lib/utils";

const reactions = [
  { id: "clear", emoji: "👍", labelKey: "reactionClear" },
  { id: "learned", emoji: "💡", labelKey: "reactionLearned" },
  { id: "question", emoji: "❓", labelKey: "reactionQuestion" },
] as const;

export interface FeedbackBoxProps {
  slug: string;
  articleTitle: string;
  className?: string;
}

type Feedback = { tone: "ok" | "error"; text: string } | null;

/** Oxucu rəyi + həkimə birbaşa sual bloku */
export function FeedbackBox({ slug, articleTitle, className }: FeedbackBoxProps) {
  return (
    <Card className={cn("flex flex-col gap-space-md", className)}>
      <ReactionPicker slug={slug} />
      <QuestionForm slug={slug} articleTitle={articleTitle} />
    </Card>
  );
}

/* --------------------------------------------------------------
 * Reaksiya seçimi
 * ------------------------------------------------------------ */

/*
 * Seçim brauzerdə saxlanılır — sayt qeydiyyatsızdır, ona görə «bu oxucu
 * artıq səs verib» faktını başqa cür bilmək mümkün deyil. Sayğacların
 * özü serverdədir.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function reactionKey(slug: string) {
  return `dr-reaction-${slug}`;
}

function readReaction(slug: string): string | null {
  try {
    return window.localStorage.getItem(reactionKey(slug));
  } catch {
    /* localStorage bağlıdırsa seçim sadəcə yadda qalmır */
    return null;
  }
}

function ReactionPicker({ slug }: { slug: string }) {
  const selected = useSyncExternalStore(
    subscribe,
    useCallback(() => readReaction(slug), [slug]),
    /* Serverdə oxucunun nə seçdiyi bilinmir */
    () => null,
  );
  const t = useTranslations("feedback");
  const [failed, setFailed] = useState(false);

  async function choose(id: string) {
    const previous = readReaction(slug);
    /* Eyni düyməyə təkrar basmaq seçimi geri götürür */
    const next = previous === id ? null : id;

    try {
      if (next) window.localStorage.setItem(reactionKey(slug), next);
      else window.localStorage.removeItem(reactionKey(slug));
    } catch {
      /* yaddaş yoxdursa da səs serverə gedir */
    }
    for (const listener of listeners) listener();

    const result = await submitArticleReaction(slug, next, previous);
    setFailed(result === null && next !== null);
  }

  return (
    <div className="flex flex-col gap-space-xs">
      <span className="flex items-center gap-space-xs">
        <Icon name="thumb_up" size={20} className="text-secondary" />
        <span className="font-headline text-headline-sm text-on-surface">
          {t("reactionTitle")}
        </span>
      </span>
      <p className="font-body text-body-sm text-on-surface-variant">
        {t("reactionSubtitle")}
      </p>

      <div className="flex flex-wrap gap-space-xs">
        {reactions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => choose(r.id)}
            aria-pressed={selected === r.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-space-sm py-2 rounded-full border font-label text-label-sm transition-colors",
              selected === r.id
                ? "border-secondary bg-secondary/10 text-on-secondary-container font-semibold"
                : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/40",
            )}
          >
            <span aria-hidden="true">{r.emoji}</span>
            {t(r.labelKey)}
          </button>
        ))}
      </div>

      {failed ? (
        <p className="flex items-center gap-1 font-label text-label-sm text-error">
          <Icon name="error" size={14} />
          {t("reactionFailed")}
        </p>
      ) : (
        selected && (
          <p className="flex items-center gap-1 font-label text-label-sm text-secondary">
            <Icon name="check_circle" size={14} />
            {t("reactionThanks")}
          </p>
        )
      )}
    </div>
  );
}

/* --------------------------------------------------------------
 * Həkimə sual
 * ------------------------------------------------------------ */

function QuestionForm({
  slug,
  articleTitle,
}: {
  slug: string;
  articleTitle: string;
}) {
  const t = useTranslations("feedback");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [nameError, setNameError] = useState<string | undefined>();
  const [contactError, setContactError] = useState<string | undefined>();
  const [questionError, setQuestionError] = useState<string | undefined>();

  async function handleSend() {
    setFeedback(null);
    setNameError(undefined);
    setContactError(undefined);
    setQuestionError(undefined);

    /* Serverdəki eyni qaydalar — sahə göndərilmədən əvvəl birbaşa qırmızılaşır */
    if (name.trim().length < 3) {
      setNameError(t("errorNameShort"));
      return;
    }
    if (
      !/^\S+@\S+\.\S+$/.test(contact.trim()) &&
      !/^[+\d][\d\s()-]{8,}$/.test(contact.trim())
    ) {
      setContactError(t("errorContact"));
      return;
    }
    if (question.trim().length < 10) {
      setQuestionError(t("errorQuestionShort"));
      return;
    }

    setSending(true);
    try {
      const result = await submitArticleQuestion({
        slug,
        articleTitle,
        fullName: name,
        contact,
        question,
      });
      setFeedback({
        tone: result.success ? "ok" : "error",
        text: result.message,
      });
      /* Yalnız uğurlu göndərişdə təmizlənir — əks halda yazılanlar itər */
      if (result.success) setQuestion("");
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
    <div className="pt-space-sm border-t border-surface-container flex flex-col gap-space-xs">
      <span className="font-label text-label-lg text-on-surface">
        {t("questionTitle")}
      </span>

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
          label={t("contactLabel")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={t("contactPlaceholder")}
          autoComplete="email"
          error={contactError}
        />
      </div>

      <TextAreaField
        label={t("questionLabel")}
        rows={3}
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value);
          setFeedback(null);
          setQuestionError(undefined);
        }}
        placeholder={t("questionPlaceholder")}
        error={questionError}
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
            size={14}
            className="mt-0.5 shrink-0"
          />
          {feedback.text}
        </p>
      )}

      <div className="flex items-center justify-between gap-space-sm flex-wrap">
        <span className="flex items-center gap-1 font-label text-label-sm text-outline">
          <Icon name="help_outline" size={14} />
          {t("responseTimeHint")}
        </span>
        <Button
          type="button"
          size="sm"
          icon="send"
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? t("sending") : t("send")}
        </Button>
      </div>
    </div>
  );
}
