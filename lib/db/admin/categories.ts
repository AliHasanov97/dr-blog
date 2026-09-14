import { prisma } from "@/lib/prisma";
import { mergeTranslations } from "@/lib/i18n/translations";
import { slugify } from "./slugify";

export async function dbGetCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function dbListCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    translations: (c.translations as Record<string, { name?: string }> | null) ?? {},
    icon: c.icon ?? "sell",
    articleCount: c._count.articles,
  }));
}

export async function dbCreateCategory(data: {
  name: string;
  slug?: string;
  icon?: string;
  /** Digər dillərdəki ad — açar dil kodu (məs. "ru") */
  translations?: Record<string, { name?: string }>;
}) {
  const slug = data.slug?.trim() || slugify(data.name);
  return prisma.category.create({
    data: {
      slug,
      name: data.name,
      icon: data.icon || "sell",
      translations: data.translations ?? undefined,
    },
  });
}

export async function dbUpdateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    icon?: string;
    /** Redaktə olunan dillər üçün tam dəst — söndürülmüş dillərin köhnə tərcüməsi toxunulmur (bax: mergeTranslations) */
    translations?: Record<string, { name?: string }>;
  },
) {
  let translations: Record<string, unknown> | undefined;
  if (data.translations !== undefined) {
    const current = await prisma.category.findUnique({
      where: { id },
      select: { translations: true },
    });
    translations = mergeTranslations(current?.translations, data.translations);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(translations !== undefined && { translations: translations as object }),
      ...(data.slug && { slug: slugify(data.slug) }),
      ...(data.icon && { icon: data.icon }),
    },
  });
}

export async function dbDeleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
