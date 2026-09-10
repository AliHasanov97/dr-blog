import type { ArticleStatus, CommentStatus, MessageStatus } from "@/lib/mock/store";

export const articleStatusLabels: Record<ArticleStatus, string> = {
  published: "Saytda görünür",
  draft: "Qaralama",
  review: "Yoxlanılır",
};

export const commentStatusLabels: Record<CommentStatus, string> = {
  approved: "Təsdiqlənib",
  pending: "Gözləyir",
  rejected: "Rədd edilib",
};

export const messageStatusLabels: Record<MessageStatus, string> = {
  new: "Yeni",
  read: "Oxunub",
  answered: "Cavablandırılıb",
  archived: "Arxivdə",
};

export const articleStatusOptions = (
  Object.keys(articleStatusLabels) as ArticleStatus[]
).map((value) => ({ value, label: articleStatusLabels[value] }));

/** Tarixi Azərbaycan formatında etiketə çevirir: 2024-11-14 → 14 Noyabr 2024 */
const months = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

export function toDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
