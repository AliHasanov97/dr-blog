"use server";

import { revalidatePath } from "next/cache";
import { revalidateSitePath } from "@/lib/revalidate-site";
import type { ActionResult } from "@/lib/admin/types";
import { nextId, slugify, store } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import {
  dbCreateCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbCreateVideo,
  dbUpdateVideo,
  dbDeleteVideo,
  dbCreateProtocol,
  dbUpdateProtocol,
  dbDeleteProtocol,
  dbCreateFaq,
  dbUpdateFaq,
  dbDeleteFaq,
} from "@/lib/db/admin";

type Row = { id: string } & Record<string, unknown>;
type CollectionKey =
  | "categories"
  | "videos"
  | "protocols"
  | "faq";

/** Sahə dəyərlərini qeyd obyektinə çevirən köməkçi */
type Mapper = (values: Record<string, string>, existing?: Row) => Row;

const paths: Record<CollectionKey, string[]> = {
  categories: ["/admin/kateqoriyalar", "/articles"],
  videos: ["/admin/videolar", "/articles"],
  protocols: ["/admin/protokollar", "/articles"],
  faq: ["/admin/elaqe", "/contact"],
};

function refresh(key: CollectionKey) {
  for (const path of paths[key]) {
    if (path.startsWith("/admin")) revalidatePath(path);
    else revalidateSitePath(path);
  }
}

function collection(key: CollectionKey): Row[] {
  return store[key] as unknown as Row[];
}

const mappers: Record<CollectionKey, Mapper> = {
  categories: (v, existing) => ({
    id: existing?.id ?? nextId("cat"),
    slug: v.slug?.trim() ? slugify(v.slug) : slugify(v.name),
    name: v.name,
    nameRu: v.nameRu?.trim() || undefined,
    icon: v.icon || "sell",
    articleCount: existing?.articleCount ?? 0,
  }),
  videos: (v, existing) => ({
    id: existing?.id ?? nextId("vid"),
    title: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnailUrl || "/images/video-ekg.svg",
    kindLabel: v.kindLabel || "Klinik Vebinar",
    language: v.language || "az",
    url: v.url || "#",
  }),
  protocols: (v, existing) => ({
    id: existing?.id ?? nextId("pdf"),
    title: v.title,
    description: v.description,
    fileSizeLabel: v.fileSizeLabel || "—",
    fileUrl: v.fileUrl || "#",
    access: v.access || "download",
    language: v.language || "az",
  }),
  faq: (v, existing) => ({
    id: existing?.id ?? nextId("faq"),
    question: v.question,
    answer: v.answer,
  }),
};

export async function createResource(
  key: CollectionKey,
  values: Record<string, string>,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      switch (key) {
        case "categories":
          await dbCreateCategory({
            name: values.name,
            nameRu: values.nameRu,
            slug: values.slug,
            icon: values.icon,
          });
          break;
        case "videos":
          await dbCreateVideo({
            title: values.title,
            description: values.description,
            thumbnailUrl: values.thumbnailUrl,
            videoUrl: values.url || "#",
            kindLabel: values.kindLabel,
            language: values.language,
          });
          break;
        case "protocols":
          await dbCreateProtocol({
            id: values.id,
            title: values.title,
            description: values.description,
            fileSizeLabel: values.fileSizeLabel,
            fileUrl: values.fileUrl || "#",
            access: values.access,
            language: values.language,
          });
          break;
        case "faq":
          await dbCreateFaq({ question: values.question, answer: values.answer });
          break;
      }
      refresh(key);
      return { success: true };
    } catch (error) {
      console.error("Create error:", error);
      return { success: false, message: "Xəta baş verdi." };
    }
  }

  collection(key).push(mappers[key](values));
  refresh(key);
  return { success: true };
}

export async function updateResource(
  key: CollectionKey,
  id: string,
  values: Record<string, string>,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      switch (key) {
        case "categories":
          await dbUpdateCategory(id, {
            name: values.name,
            nameRu: values.nameRu,
            slug: values.slug,
            icon: values.icon,
          });
          break;
        case "videos":
          await dbUpdateVideo(id, {
            title: values.title,
            description: values.description,
            thumbnailUrl: values.thumbnailUrl,
            videoUrl: values.url,
            kindLabel: values.kindLabel,
            language: values.language,
          });
          break;
        case "protocols":
          await dbUpdateProtocol(id, values);
          break;
        case "faq":
          await dbUpdateFaq(id, { question: values.question, answer: values.answer });
          break;
      }
      refresh(key);
      return { success: true };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, message: "Qeyd tapılmadı." };
    }
  }

  const rows = collection(key);
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return { success: false, message: "Qeyd tapılmadı." };
  rows[index] = mappers[key](values, rows[index]);
  refresh(key);
  return { success: true };
}

export async function deleteResource(
  key: CollectionKey,
  id: string,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      switch (key) {
        case "categories":
          await dbDeleteCategory(id);
          break;
        case "videos":
          await dbDeleteVideo(id);
          break;
        case "protocols":
          await dbDeleteProtocol(id);
          break;
        case "faq":
          await dbDeleteFaq(id);
          break;
      }
      refresh(key);
      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return { success: false, message: "Qeyd tapılmadı." };
    }
  }

  const rows = collection(key);
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return { success: false, message: "Qeyd tapılmadı." };
  rows.splice(index, 1);
  refresh(key);
  return { success: true };
}
