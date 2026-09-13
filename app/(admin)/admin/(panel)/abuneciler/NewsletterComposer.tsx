"use client";

import { useState, useTransition } from "react";
import { AdminCard } from "@/components/admin";
import { Button, Icon, TextAreaField, TextField } from "@/components/ui";
import { sendNewsletter, testMailConnection } from "./actions";
import { cn } from "@/lib/utils";

export interface NewsletterComposerProps {
  activeCount: number;
}

type Feedback = { tone: "ok" | "error"; text: string } | null;

/**
 * Bülleten yazma və göndərmə forması.
 *
 * Göndəriş geri qaytarıla bilməz, ona görə düymə iki mərhələlidir:
 * əvvəlcə təsdiq soruşulur, sonra göndərilir.
 */
export function NewsletterComposer({ activeCount }: NewsletterComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  /*
   * Göndərişin hazır olub-olmaması. Əvvəllər düymə sadəcə passiv qalırdı —
   * istifadəçi klikləyir, heç nə olmurdu və səbəbi görünmürdü.
   */
  const MIN_SUBJECT = 3;
  const MIN_BODY = 20;

  const ready =
    subject.trim().length >= MIN_SUBJECT &&
    body.trim().length >= MIN_BODY &&
    activeCount > 0;

  /* Yazmağa başlanmış, amma hələ qısa olan sahə qırmızılaşır — boş sahəyə
   * səhifə açılan kimi qırmızı vurmaq vaxtından əvvəl xəbərdarlıq olardı */
  const subjectError =
    subject.length > 0 && subject.trim().length < MIN_SUBJECT
      ? `Ən azı ${MIN_SUBJECT} simvol olmalıdır`
      : undefined;
  const bodyError =
    body.length > 0 && body.trim().length < MIN_BODY
      ? `Ən azı ${MIN_BODY} simvol olmalıdır (hazırda ${body.trim().length})`
      : undefined;

  function runTest() {
    setFeedback(null);
    startTransition(async () => {
      const result = await testMailConnection();
      setFeedback({
        tone: result.success ? "ok" : "error",
        text: result.message ?? "",
      });
    });
  }

  function send() {
    setConfirming(false);
    setFeedback(null);
    startTransition(async () => {
      const result = await sendNewsletter(subject, body);
      setFeedback({
        tone: result.success ? "ok" : "error",
        text: result.message ?? "",
      });
      if (result.success) {
        setSubject("");
        setBody("");
      }
    });
  }

  return (
    <AdminCard title="Bülleten göndər" className="mb-space-lg">
      <div className="flex flex-col gap-space-sm">
        <TextField
          label="Mövzu"
          placeholder="Həftəlik icmal: ürək sağlamlığı və stress"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={subjectError}
        />
        <TextAreaField
          label="Mətn"
          rows={8}
          placeholder={
            "Salam!\n\nBu həftənin əsas mövzusu...\n\nBoş sətir yeni abzas yaradır."
          }
          value={body}
          onChange={(e) => setBody(e.target.value)}
          error={bodyError}
        />

        <p className="flex items-start gap-1 font-label text-label-sm text-outline leading-snug">
          <Icon name="info" size={14} className="mt-0.5 shrink-0" />
          Hər abunəçiyə ayrıca məktub gedir — ünvanlar bir-birinə görünmür və
          hər məktubda oxucunun öz «abunəlikdən çıx» linki olur.
        </p>

        {/* Sahəyə bağlı olmayan tək səbəb — mövzu/mətn xətaları artıq öz sahələrinin altındadır */}
        {activeCount === 0 && (
          <p className="flex items-start gap-1 font-label text-label-sm text-on-tertiary-container leading-snug">
            <Icon name="edit_note" size={14} className="mt-0.5 shrink-0" />
            Göndərmək üçün aktiv abunəçi olmalıdır.
          </p>
        )}

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

        <div className="flex items-center justify-between gap-space-sm flex-wrap pt-space-2xs">
          <Button
            variant="ghost"
            size="sm"
            icon="wifi_tethering"
            disabled={pending}
            onClick={runTest}
          >
            Gmail bağlantısını yoxla
          </Button>

          {confirming ? (
            <span className="flex items-center gap-space-xs">
              <span className="font-label text-label-sm text-on-surface-variant">
                {activeCount} abunəçiyə göndərilsin?
              </span>
              <Button size="sm" icon="send" disabled={pending} onClick={send}>
                {pending ? "Göndərilir..." : "Bəli, göndər"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirming(false)}
              >
                Ləğv et
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              icon="send"
              disabled={!ready || pending || activeCount === 0}
              onClick={() => setConfirming(true)}
            >
              {activeCount === 0
                ? "Aktiv abunəçi yoxdur"
                : ready
                  ? `${activeCount} abunəçiyə göndər`
                  : "Mətni tamamlayın"}
            </Button>
          )}
        </div>
      </div>
    </AdminCard>
  );
}
