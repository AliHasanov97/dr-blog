"use client";

import { useState, useTransition } from "react";
import { Button, Icon, TextField } from "@/components/ui";
import { changePasswordAction } from "./actions";
import { cn } from "@/lib/utils";

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  function submit() {
    setFeedback(null);
    if (next.length < 8) {
      setFeedback({ tone: "error", text: "Yeni şifrə ən azı 8 simvol olmalıdır." });
      return;
    }
    if (next !== confirm) {
      setFeedback({ tone: "error", text: "Yeni şifrələr üst-üstə düşmür." });
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction(current, next);
      setFeedback(
        result.success
          ? { tone: "ok", text: result.message ?? "Şifrə dəyişdirildi." }
          : { tone: "error", text: result.message ?? "Alınmadı." },
      );
      if (result.success) {
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    });
  }

  return (
    <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-space-md flex flex-col gap-space-md max-w-md">
      <div className="relative">
        <TextField
          label="Cari şifrə"
          type={showPasswords ? "text" : "password"}
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>

      <TextField
        label="Yeni şifrə"
        type={showPasswords ? "text" : "password"}
        required
        minLength={8}
        hint="Ən azı 8 simvol"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />

      <TextField
        label="Yeni şifrə (təkrar)"
        type={showPasswords ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        type="button"
        onClick={() => setShowPasswords((v) => !v)}
        className="self-start inline-flex items-center gap-1 font-label text-label-sm text-outline hover:text-on-surface"
      >
        <Icon name={showPasswords ? "visibility_off" : "visibility"} size={15} />
        {showPasswords ? "Şifrələri gizlət" : "Şifrələri göstər"}
      </button>

      {feedback && (
        <p
          className={cn(
            "flex items-center gap-1 font-label text-label-md",
            feedback.tone === "ok" ? "text-secondary" : "text-error",
          )}
        >
          <Icon name={feedback.tone === "ok" ? "check_circle" : "error"} size={16} />
          {feedback.text}
        </p>
      )}

      <Button icon="lock_reset" onClick={submit} disabled={pending} className="self-start">
        {pending ? "Yenilənir..." : "Şifrəni dəyiş"}
      </Button>
    </div>
  );
}
