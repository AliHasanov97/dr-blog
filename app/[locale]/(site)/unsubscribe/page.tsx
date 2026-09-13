import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout";
import { ButtonLink, Card, Icon } from "@/components/ui";
import { dbFindSubscriberByToken } from "@/lib/db/contact";
import { UnsubscribeConfirm } from "./UnsubscribeConfirm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("unsubscribe");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

/**
 * Bülleten məktublarındakı «abunəlikdən çıx» linkinin açdığı səhifə.
 *
 * Səhifə YALNIZ tokeni yoxlayır — çıxışın özü oxucu düyməyə basanda baş
 * verir. Əvvəllər səhifə açılan kimi çıxış edilirdi və bu, real problem
 * yaratdı: Gmail məktubdakı linkləri təhlükəsizlik üçün avtomatik açır,
 * nəticədə abunəçi heç nə etmədən siyahıdan düşürdü.
 */
export default async function UnsubscribePage({ searchParams }: PageProps) {
  const [{ token }, t] = await Promise.all([
    searchParams,
    getTranslations("unsubscribe"),
  ]);
  const clean = (token ?? "").trim();
  const subscriber = clean ? await dbFindSubscriberByToken(clean) : null;

  return (
    <PageShell
      width="content"
      className="flex flex-col items-center gap-space-lg py-space-3xl"
    >
      {subscriber ? (
        <UnsubscribeConfirm
          token={clean}
          email={subscriber.email}
          alreadyInactive={!subscriber.isActive}
        />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-space-sm text-center py-space-xl">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-error-container text-error">
              <Icon name="error" size={30} />
            </span>
            <h1 className="font-headline text-headline-md text-on-surface">
              {t("linkNotRecognized")}
            </h1>
            <p className="font-body text-body-md text-on-surface-variant leading-relaxed max-w-md">
              {clean ? t("linkExpired") : t("linkIncomplete")}
            </p>
          </Card>
          <ButtonLink href="/" localized icon="home">
            {t("backHome")}
          </ButtonLink>
        </>
      )}
    </PageShell>
  );
}
