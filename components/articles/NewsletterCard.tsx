"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { subscribeToNewsletter } from "@/app/[locale]/(site)/actions";
import { cn } from "@/lib/utils";

export interface NewsletterCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

/** Tibbi bülleten abunə kartı — tünd «primary-container» fonlu */
export function NewsletterCard({
  title,
  subtitle,
  description,
  className,
}: NewsletterCardProps) {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setMessage(t("form.errorEmail"));
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
      setMessage(t("form.subscribeFailedRetry"));
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
              {title ?? t("defaultTitle")}
            </span>
          </span>
          <p className="font-body text-body-sm text-on-primary-container">
            {subtitle ?? t("defaultSubtitle")}
          </p>
          <p className="font-body text-body-sm text-on-primary-container/80 leading-relaxed">
            {description ?? t("defaultDescription")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-xs lg:w-80 shrink-0">
          <div className="flex gap-space-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={t("emailPlaceholder")}
              aria-label={t("emailAriaLabel")}
              aria-invalid={status === "error"}
              className={cn(
                "flex-1 h-11 px-space-sm rounded-md bg-white/10 font-body text-body-sm text-white placeholder:text-white/50 outline-none border",
                status === "error"
                  ? "border-error ring-2 ring-error/30"
                  : "border-white/20 focus:border-secondary-fixed focus:ring-2 focus:ring-secondary-fixed/30",
              )}
            />
            <Button
              type="submit"
              variant="tonal"
              size="md"
              disabled={status === "loading"}
              className="shrink-0"
            >
              {status === "loading" ? "..." : t("subscribeCta")}
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
              {t("privacyHint")}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
