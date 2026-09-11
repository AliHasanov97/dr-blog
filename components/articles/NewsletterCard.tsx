"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { subscribeToNewsletter } from "@/app/(site)/actions";
import { cn } from "@/lib/utils";

export interface NewsletterCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

/** Tibbi bülleten abunə kartı — tünd «primary-container» fonlu */
export function NewsletterCard({
  title = "Həftəlik Tibbi Bülleten",
  subtitle = "Elmi yeniliklər və kardiologiya təhlilləri poçtunuzda",
  description = "Həkimin rəhbərliyi ilə hazırlanan sübutlu tibb xülasələri və sağlam həyat bələdçisi.",
  className,
}: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setMessage("Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.");
      return;
    }
    setStatus("loading");
    try {
      const result = await subscribeToNewsletter(email);
      setStatus(result.success ? "done" : "error");
      setMessage(result.message);
      if (result.success) setEmail("");
    } catch {
      setStatus("error");
      setMessage("Abunə qeydə alınmadı. Bir azdan yenidən cəhd edin.");
    }
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary-container text-on-primary p-card-padding lg:p-space-xl shadow-level-2",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-secondary/20 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col gap-space-sm lg:flex-row lg:items-center lg:justify-between lg:gap-space-2xl">
        <div className="flex flex-col gap-space-2xs lg:max-w-md">
          <span className="flex items-center gap-space-xs">
            <Icon name="mail" size={20} className="text-secondary-fixed" />
            <span className="font-headline text-headline-md text-on-primary">
              {title}
            </span>
          </span>
          <p className="font-body text-body-sm text-on-primary-container">
            {subtitle}
          </p>
          <p className="font-body text-body-sm text-on-primary-container/80 leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-xs lg:w-80 shrink-0">
          <div className="flex gap-space-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="poct@unvan.az"
              aria-label="E-poçt ünvanınız"
              className="flex-1 h-11 px-space-sm rounded-md bg-white/10 border border-white/20 font-body text-body-sm text-white placeholder:text-white/50 outline-none focus:border-secondary-fixed focus:ring-2 focus:ring-secondary-fixed/30"
            />
            <Button
              type="submit"
              variant="tonal"
              size="md"
              disabled={status === "loading"}
              className="shrink-0"
            >
              {status === "loading" ? "..." : "Abunə ol"}
            </Button>
          </div>

          {status === "done" || status === "error" ? (
            <p
              className={cn(
                "flex items-center gap-1 font-label text-label-sm",
                status === "done" ? "text-secondary-fixed" : "text-error-container",
              )}
            >
              <Icon name={status === "done" ? "check_circle" : "error"} size={14} />
              {message}
            </p>
          ) : (
            <p className="flex items-center gap-1 font-label text-label-sm text-on-primary-container/70">
              <Icon name="lock" size={13} />
              Spam göndərilmir. İstənilən vaxt çıxa bilərsiniz.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
