import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout";
import { ButtonLink, EmptyState } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <PageShell width="content" className="flex flex-col items-center gap-space-lg py-space-3xl">
      <EmptyState
        icon="find_in_page"
        title={t("title")}
        description={t("description")}
      />
      <ButtonLink href="/" localized icon="home">
        {t("backHome")}
      </ButtonLink>
    </PageShell>
  );
}
