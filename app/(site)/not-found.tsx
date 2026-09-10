import { PageShell } from "@/components/layout";
import { ButtonLink, EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <PageShell width="content" className="flex flex-col items-center gap-space-lg py-space-3xl">
      <EmptyState
        icon="find_in_page"
        title="Səhifə tapılmadı"
        description="Axtardığınız məqalə silinmiş və ya ünvan dəyişmiş ola bilər."
      />
      <ButtonLink href="/" icon="home">
        Ana səhifəyə qayıt
      </ButtonLink>
    </PageShell>
  );
}
