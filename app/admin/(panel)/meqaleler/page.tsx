import { AdminPageHeader, HelpNote } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { listArticles } from "@/lib/admin/queries";
import { ArticleListClient } from "./ArticleListClient";

/** Admin siyahısında bir dəfəyə göstərilən məqalə sayı */
const PAGE_SIZE = 10;

export const metadata = { title: "Məqalələr" };

export default async function AdminArticlesPage() {
  /* İlk səhifə serverdə hazırlanır; qalanı «Daha çox» ilə yüklənir */
  const initial = await listArticles({ pageSize: PAGE_SIZE });

  return (
    <>
      <AdminPageHeader
        title="Məqalələr"
        description={`${initial.total} məqalə`}
        icon="article"
        actions={
          <ButtonLink href="/admin/meqaleler/yeni" icon="add">
            Yeni məqalə
          </ButtonLink>
        }
      />
      <HelpNote title="Bu siyahı ilə nə edə bilərəm?" className="mb-space-md">
        <ul>
          <li>
            <strong>Başlığa klikləyin</strong> — məqaləni redaktə edin.
          </li>
          <li>
            <strong>Vəziyyət nişanına klikləyin</strong> — məqaləni saytda
            göstərin və ya gizlədin. Gizli məqalə itmir, sadəcə oxuculara
            görünmür.
          </li>
          <li>
            <strong>Göz ikonu</strong> — məqalənin saytdakı görünüşünü yeni
            pəncərədə açır.
          </li>
          <li>
            <strong>«Oxucu rəyi» sütunu</strong> — məqalənin sonundakı «Bu
            məqalə sizin üçün faydalı oldu?» sualına verilən cavabların sayı:
            👍 çox aydın və faydalı, 💡 yeni məlumat öyrəndim, ❓ həkimə sualım
            var. Bu, şərhlərdən ayrıdır — oxucu ad yazmadan, bir kliklə səs
            verir və fikrini dəyişə bilər.
          </li>
        </ul>
      </HelpNote>
      <ArticleListClient
        initial={initial}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
