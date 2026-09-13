import { notFound } from "next/navigation";
import { AdminPageHeader, ArticleForm } from "@/components/admin";
import { coverOptions } from "@/lib/admin/covers";
import { getArticle, listCategories } from "@/lib/admin/queries";
import { updateArticle } from "../actions";
import type { ArticlePayload } from "../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    getArticle(id),
    listCategories(),
  ]);
  if (!article) notFound();

  async function handleSubmit(payload: ArticlePayload) {
    "use server";
    return updateArticle(id, payload);
  }

  return (
    <>
      <AdminPageHeader
        title="Məqaləni redaktə et"
        description={article.title}
        icon="edit_document"
      />
      <ArticleForm
        article={article}
        categories={categories.filter((c: any) => c.slug !== "hamisi")}
        coverOptions={coverOptions}
        onSubmit={handleSubmit}
      />
    </>
  );
}
