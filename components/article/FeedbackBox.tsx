"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Button, Card, Icon, TextAreaField } from "@/components/ui";
import {
  submitArticleQuestion,
  submitArticleReaction,
} from "@/app/(site)/meqaleler/[slug]/actions";
import { cn } from "@/lib/utils";

const reactions = [
  { id: "clear", emoji: "👍", label: "Çox aydın və faydalı" },
  { id: "learned", emoji: "💡", label: "Yeni məlumat öyrəndim" },
  { id: "question", emoji: "❓", label: "Həkimə sualım var" },
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
          Bu məqalə sizin üçün faydalı oldu?
        </span>
      </span>
      <p className="font-body text-body-sm text-on-surface-variant">
        Sizin rəyiniz kliniki materiallarımızın tərtibatında mühüm əhəmiyyət
        daşıyır:
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
            {r.label}
          </button>
        ))}
      </div>

      {failed ? (
        <p className="flex items-center gap-1 font-label text-label-sm text-error">
          <Icon name="error" size={14} />
          Rəyiniz qeydə alınmadı. Bir azdan yenidən cəhd edin.
        </p>
      ) : (
        selected && (
          <p className="flex items-center gap-1 font-label text-label-sm text-secondary">
            <Icon name="check_circle" size={14} />
            Təşəkkür edirik! Rəyiniz qeydə alındı.
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
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSend() {
    setSending(true);
    setFeedback(null);
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
        text: "Sual göndərilmədi. İnternet bağlantınızı yoxlayın.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pt-space-sm border-t border-surface-container flex flex-col gap-space-xs">
      <span className="font-label text-label-lg text-on-surface">
        Həkimə birbaşa sual və ya rəy göndərin
      </span>

      <div className="grid gap-space-xs sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınız və soyadınız"
          aria-label="Adınız"
          autoComplete="name"
          className="h-11 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-space-sm font-body text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary-container focus:ring-2 focus:ring-tertiary-fixed-dim/50"
        />
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="E-poçt və ya telefon"
          aria-label="Əlaqə vasitəsi"
          autoComplete="email"
          className="h-11 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-space-sm font-body text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary-container focus:ring-2 focus:ring-tertiary-fixed-dim/50"
        />
      </div>

      <TextAreaField
        label="Sualınız"
        rows={3}
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value);
          setFeedback(null);
        }}
        placeholder="Sualınızı buraya yazın..."
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
          Cavablar 24-48 saat ərzində verilir.
        </span>
        <Button
          type="button"
          size="sm"
          icon="send"
          disabled={sending}
          onClick={handleSend}
        >
          {sending ? "Göndərilir..." : "Göndər"}
        </Button>
      </div>
    </div>
  );
}
