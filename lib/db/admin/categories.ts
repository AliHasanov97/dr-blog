import { prisma } from "@/lib/prisma";
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
    nameRu: c.nameRu ?? "",
    icon: c.icon ?? "sell",
    articleCount: c._count.articles,
  }));
}

export async function dbCreateCategory(data: {
  name: string;
  nameRu?: string;
  slug?: string;
  icon?: string;
}) {
  const slug = data.slug?.trim() || slugify(data.name);
  return prisma.category.create({
    data: {
      slug,
      name: data.name,
      nameRu: data.nameRu?.trim() || null,
      icon: data.icon || "sell",
    },
  });
}

export async function dbUpdateCategory(
  id: string,
  data: { name?: string; nameRu?: string; slug?: string; icon?: string },
) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      /* Boş dəyər QƏSDƏN yazılır — RU ad silinib AZ-a geri qayıtsın deyə */
      ...(data.nameRu !== undefined && { nameRu: data.nameRu.trim() || null }),
      ...(data.slug && { slug: slugify(data.slug) }),
      ...(data.icon && { icon: data.icon }),
    },
  });
}

export async function dbDeleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
