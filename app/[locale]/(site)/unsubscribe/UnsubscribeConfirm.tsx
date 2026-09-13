"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, ButtonLink, Card, Icon } from "@/components/ui";
import { confirmUnsubscribe } from "./actions";

export interface UnsubscribeConfirmProps {
  token: string;
  /** Hansı ünvanın söhbəti getdiyi — oxucu əmin olsun deyə */
  email: string;
  /** Ünvan artıq siyahıda deyilsə təsdiq soruşulmur */
  alreadyInactive: boolean;
}

type State =
  | { step: "confirm" }
  | { step: "done"; message: string }
  | { step: "failed"; message: string };

/**
 * Abunəlikdən çıxmanın təsdiqi.
 *
 * Çıxış səhifə açılan kimi deyil, yalnız düyməyə basanda baş verir.
 * Səbəb: Gmail və digər poçt xidmətləri məktubdakı linkləri təhlükəsizlik
 * üçün avtomatik açır — səhifənin özü çıxış etsəydi, oxucu heç nə etmədən
 * siyahıdan düşərdi.
 */
export function UnsubscribeConfirm({
  token,
  email,
  alreadyInactive,
}: UnsubscribeConfirmProps) {
  const t = useTranslations("unsubscribe");
  const [state, setState] = useState<State>(
    alreadyInactive
      ? { step: "done", message: t("alreadyInactive") }
      : { step: "confirm" },
  );
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    try {
      const result = await confirmUnsubscribe(token);
      setState({
        step: result.success ? "done" : "failed",
        message: result.message,
      });
    } catch {
      setState({
        step: "failed",
        message: t("genericError"),
      });
    } finally {
      setPending(false);
    }
  }

  const done = state.step === "done";

  return (
    <>
      <Card className="flex flex-col items-center gap-space-sm text-center py-space-xl">
        <span
          className={
            state.step === "failed"
              ? "flex items-center justify-center w-14 h-14 rounded-full bg-error-container text-error"
              : "flex items-center justify-center w-14 h-14 rounded-full bg-secondary/12 text-secondary"
          }
        >
          <Icon
            name={
              state.step === "failed"
                ? "error"
                : done
                  ? "unsubscribe"
                  : "mail"
            }
            size={30}
          />
        </span>

        <h1 className="font-headline text-headline-md text-on-surface">
          {state.step === "confirm"
            ? t("confirmTitle")
            : done
              ? t("doneTitle")
              : t("failedTitle")}
        </h1>

        {state.step === "confirm" ? (
          <>
            <p className="font-body text-body-md text-on-surface-variant leading-relaxed max-w-md">
              {t("confirmDescription")}
            </p>
            <p className="font-label text-label-sm text-outline">{email}</p>
            <Button
              icon="unsubscribe"
              disabled={pending}
              onClick={submit}
              className="mt-space-xs"
            >
              {pending ? t("pending") : t("confirmCta")}
            </Button>
          </>
        ) : (
          <>
            <p className="font-body text-body-md text-on-surface-variant leading-relaxed max-w-md">
              {state.message}
            </p>
            {email && (
              <p className="font-label text-label-sm text-outline">{email}</p>
            )}
            {done && (
              <p className="font-body text-body-sm text-outline leading-relaxed max-w-md">
                {t("resubscribeHint")}
              </p>
            )}
          </>
        )}
      </Card>

      <ButtonLink href="/" localized icon="home">
        {t("backHome")}
      </ButtonLink>
    </>
  );
}
