"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, Icon, TextField } from "@/components/ui";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

export interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction, {});
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* Server gözləmədən, real vaxtda — "confirm" sahəsi birbaşa qırmızılaşır */
  const confirmError =
    confirm.length > 0 && password !== confirm ? "Şifrələr üst-üstə düşmür" : undefined;

  if (state.done) {
    return (
      <div className="flex flex-col gap-space-md">
        <p className="flex items-start gap-2 rounded-md bg-secondary/10 px-space-sm py-space-sm font-label text-label-md text-on-secondary-container">
          <Icon name="check_circle" size={18} className="shrink-0 mt-0.5" />
          Şifrəniz uğurla yeniləndi. İndi yeni şifrə ilə daxil ola bilərsiniz.
        </p>
        <Link href="/admin/login">
          <Button type="button" size="lg" fullWidth icon="login">
            Daxil ol
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-space-md">
      <input type="hidden" name="token" value={token} />

      <div className="relative">
        <TextField
          label="Yeni şifrə"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Ən azı 8 simvol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
          className="absolute end-space-sm top-[2.15rem] text-outline hover:text-on-surface"
        >
          <Icon name={showPassword ? "visibility_off" : "visibility"} size={18} />
        </button>
      </div>

      <TextField
        label="Yeni şifrə (təkrar)"
        name="confirm"
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Şifrəni təkrar yazın"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirmError}
      />

      {state.error && !confirmError && (
        <p
          role="alert"
          className="flex items-center gap-1 rounded-md bg-error-container/60 px-space-sm py-space-xs font-label text-label-md text-on-error-container"
        >
          <Icon name="error" size={15} />
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth icon="lock_reset" disabled={pending}>
        {pending ? "Yenilənir..." : "Şifrəni yenilə"}
      </Button>
    </form>
  );
}
