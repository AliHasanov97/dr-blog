"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, Icon, TextField } from "@/components/ui";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(requestPasswordResetAction, {});
  const [email, setEmail] = useState("");

  if (state.sent) {
    return (
      <div className="flex flex-col gap-space-md">
        <p className="flex items-start gap-2 rounded-md bg-secondary/10 px-space-sm py-space-sm font-label text-label-md text-on-secondary-container">
          <Icon name="mark_email_read" size={18} className="shrink-0 mt-0.5" />
          Bu e-poçt qeydiyyatdadırsa, bərpa linki göndərildi. Poçt qutunuzu
          (spam qovluğu daxil) yoxlayın.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1 font-label text-label-lg text-secondary hover:underline"
        >
          <Icon name="arrow_back" size={16} />
          Girişə qayıt
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-space-md">
      <TextField
        label="E-poçt"
        name="email"
        type="email"
        required
        autoComplete="username"
        icon="alternate_email"
        placeholder="admin@drnarmin.az"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {state.error && (
        <p
          role="alert"
          className="flex items-center gap-1 rounded-md bg-error-container/60 px-space-sm py-space-xs font-label text-label-md text-on-error-container"
        >
          <Icon name="error" size={15} />
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth icon="send" disabled={pending}>
        {pending ? "Göndərilir..." : "Bərpa linki göndər"}
      </Button>

      <Link
        href="/admin/login"
        className="inline-flex items-center justify-center gap-1 font-label text-label-lg text-on-surface-variant hover:text-secondary transition-colors"
      >
        <Icon name="arrow_back" size={16} />
        Girişə qayıt
      </Link>
    </form>
  );
}
