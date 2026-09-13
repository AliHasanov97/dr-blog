"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, Icon, TextField } from "@/components/ui";
import { loginAction, type LoginState } from "./actions";
import { USE_MOCK } from "@/lib/api/config";
import { cn } from "@/lib/utils";

export interface DemoAccount {
  email: string;
  password: string;
  role: string;
  fullName: string;
}

export interface LoginFormProps {
  next: string;
  demoAccounts: DemoAccount[];
}

export function LoginForm({ next, demoAccounts }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-space-lg">
      <form action={formAction} className="flex flex-col gap-space-md">
        <input type="hidden" name="next" value={next} />

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

        <div className="relative">
          <TextField
            label="Şifrə"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
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

        <Link
          href="/admin/sifre-berpa"
          className="self-end -mt-space-xs font-label text-label-md text-secondary hover:underline"
        >
          Şifrəni unutmusunuz?
        </Link>

        {state.error && (
          <p
            role="alert"
            className="flex items-center gap-1 rounded-md bg-error-container/60 px-space-sm py-space-xs font-label text-label-md text-on-error-container"
          >
            <Icon name="error" size={15} />
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth icon="login" disabled={pending}>
          {pending ? "Yoxlanılır..." : "Daxil ol"}
        </Button>
      </form>

      {/* Demo hesabları — yalnız mock rejimdə göstərilir, baza rejimində bu
       * hesablar həqiqətən mövcud olmaya bilər */}
      {USE_MOCK && (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low/60 p-space-md">
          <p className="flex items-center gap-1 font-label text-label-sm uppercase tracking-wider text-outline mb-space-xs">
            <Icon name="science" size={14} />
            Demo hesabları (mock mərhələ)
          </p>
          <div className="flex flex-col gap-space-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className={cn(
                  "flex items-center justify-between gap-space-sm rounded-md border border-surface-container",
                  "bg-surface-container-lowest px-space-sm py-space-xs text-start",
                  "hover:border-secondary/40 transition-colors",
                )}
              >
                <span className="flex flex-col min-w-0">
                  <span className="font-label text-label-md text-on-surface truncate">
                    {acc.email}
                  </span>
                  <span className="font-label text-label-sm text-outline">
                    {acc.fullName} • {acc.password}
                  </span>
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 font-label text-label-sm text-secondary">
                  Doldur
                  <Icon name="content_paste_go" size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
