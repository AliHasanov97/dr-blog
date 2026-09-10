import { AdminPageHeader, ArticleForm } from "@/components/admin";
import { coverOptions } from "@/lib/admin/covers";
import { listCategories } from "@/lib/admin/queries";
import { createArticle } from "../actions";

export const metadata = { title: "Yeni məqalə" };

export default async function NewArticlePage() {
  const categories = await listCategories();

  return (
    <>
      <AdminPageHeader
        title="Yeni məqalə"
        description="Parametrləri doldurun, sonra məzmun bloklarını əlavə edin"
        icon="post_add"
      />
      <ArticleForm
        categories={categories.filter((c: any) => c.slug !== "hamisi")}
        coverOptions={coverOptions}
        onSubmit={createArticle}
      />
    </>
  );
}
