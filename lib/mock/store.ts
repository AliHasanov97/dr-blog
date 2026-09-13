import type {
  Article,
  Category,
  Comment,
  ContactChannel,
  DoctorProfile,
  FaqItem,
  OfficeLocation,
  ProtocolDocument,
  VideoItem,
} from "@/lib/types";
import { mockArticles, mockComments } from "./articles";
import { mockCategories } from "./categories";
import {
  mockProtocols,
  mockVideos,
} from "./content";
import { mockContactChannels, mockFaq, mockOffice } from "./contact";
import { mockDoctor } from "./doctor";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

/**
 * Dəyişdirilə bilən in-memory mock anbarı.
 *
 * Həm publik səhifələr, həm də admin panel BURADAN oxuyur — beləliklə admin-də
 * edilən dəyişiklik dərhal saytda görünür. Data prosesin yaddaşındadır:
 * dev server yenidən başlayanda ilkin vəziyyətə qayıdır. Bu, backend gələnə
 * qədər müvəqqəti həlldir.
 */

/* --------------------------------------------------------------
 * Admin-ə xas əlavə tiplər
 * ------------------------------------------------------------ */

export type ArticleStatus = "published" | "draft";
export type CommentStatus = "pending" | "approved" | "rejected";
export type MessageStatus = "new" | "read" | "answered" | "archived";

/** «Bu məqalə faydalı oldu?» blokunun sayğacları */
export interface ArticleReactions {
  clear: number;
  learned: number;
  question: number;
}

export interface AdminArticle extends Article {
  status: ArticleStatus;
  /** Məqalənin yazıldığı dil — tərcümə eyni məqalə deyil, AYRI yazıdır */
  language: "az" | "ru";
  updatedAt: string;
  reactions?: ArticleReactions;
  allowComments?: boolean;
  showTableOfContents?: boolean;
  metaDescription?: string;
}

export interface AdminComment extends Comment {
  id: string;
  articleSlug: string;
  articleTitle: string;
  status: CommentStatus;
  /** Cavab olduqda ana şərhin id-si */
  parentId?: string;
  /** Cavab olduqda — ana şərhin müəllifi və mətni (moderasiyada kontekst üçün) */
  parentAuthorName?: string;
  parentBody?: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  contact: string;
  subject: string;
  message: string;
  inquiryTypeLabel: string;
  receivedAtLabel: string;
  status: MessageStatus;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAtLabel: string;
  isActive: boolean;
}

/* Tip və standart dəyərlər `lib/settings`-dədir — baza qatı da onları
 * işlədir və bu fayl (mock anbarı) ora qoşulmasın deyə. */
export type { SiteSettings } from "@/lib/settings";

/* --------------------------------------------------------------
 * Toxum data
 * ------------------------------------------------------------ */

function seedArticles(): AdminArticle[] {
  return mockArticles.map((article, i) => ({
    ...article,
    status: i === 6 ? "draft" : "published",
    language: "az",
    updatedAt: article.publishedAt,
  }));
}

function seedComments(): AdminComment[] {
  const rows: AdminComment[] = [];
  for (const [slug, list] of Object.entries(mockComments)) {
    const article = mockArticles.find((a) => a.slug === slug);
    for (const comment of list) {
      rows.push({
        ...comment,
        articleSlug: slug,
        articleTitle: article?.title ?? slug,
        status: "approved",
        replies: undefined,
      });
      for (const reply of comment.replies ?? []) {
        rows.push({
          ...reply,
          articleSlug: slug,
          articleTitle: article?.title ?? slug,
          status: "approved",
          parentId: comment.id,
          parentAuthorName: comment.authorName,
          parentBody: comment.body,
          replies: undefined,
        });
      }
    }
  }
  rows.push({
    id: "cm-pending-1",
    authorName: "Rəşad Hüseynov",
    authorInitials: "RH",
    authorRole: "Oxucu",
    createdAtLabel: "22 Noyabr 2024 • 09:12",
    body: "Salam. Holter monitorinqini Bakıda hansı mərkəzlərdə etdirmək olar? Məqalədə qeyd olunan 24 saatlıq variant nəzərdə tutulur.",
    likeCount: 0,
    articleSlug: "sebebsiz-urek-doyuntuleri",
    articleTitle:
      "Səbəbsiz Ürək Döyüntüləri (Ekstrasistoliyalar): Nə Vaxt Təcili Həkimə Müraciət Edilməli?",
    status: "pending",
  });
  rows.push({
    id: "cm-pending-2",
    authorName: "Anonim",
    authorInitials: "AN",
    authorRole: "Oxucu",
    createdAtLabel: "21 Noyabr 2024 • 23:40",
    body: "Ən yaxşı təzyiq dərmanının adını yaza bilərsinizmi? Reseptsiz almaq istəyirəm.",
    likeCount: 0,
    articleSlug: "tezyiq-dermanlari-xronobiologiya",
    articleTitle:
      "Təzyiq dərmanları nə vaxt və necə qəbul edilməlidir? Xronobiologiya baxışından",
    status: "pending",
  });
  return rows;
}

function seedMessages(): ContactMessage[] {
  return [
    {
      id: "msg-1",
      fullName: "Kamran Əliyev",
      contact: "kamran.aliyev@example.com",
      subject: "Beynəlxalq Kardiologiya Konfransına dəvət",
      message:
        "Hörmətli Dr. Əliyeva, 2025-ci ilin mart ayında Bakıda keçiriləcək konfransda plenar məruzə ilə çıxış etməyinizi xahiş edirik. Proqramı əlavə edə bilərəm.",
      inquiryTypeLabel: "Əməkdaşlıq & Dəvət",
      receivedAtLabel: "22 Noyabr 2024 • 10:15",
      status: "new",
    },
    {
      id: "msg-2",
      fullName: "Nigar Səfərova",
      contact: "+994 55 300 00 00",
      subject: "SGLT2 məqaləsi üzrə sual",
      message:
        "Məqalədə qeyd olunan EMPEROR-Preserved sınağının Azərbaycan protokollarına təsiri barədə əlavə mənbə tövsiyə edə bilərsinizmi?",
      inquiryTypeLabel: "Elmi sual / Məqalə haqqında",
      receivedAtLabel: "21 Noyabr 2024 • 16:48",
      status: "read",
    },
    {
      id: "msg-3",
      fullName: "Elvin Quliyev",
      contact: "elvin@medpress.az",
      subject: "Müsahibə təklifi — sağlamlıq rubrikası",
      message:
        "Nəşrimizin sağlamlıq rubrikası üçün 20 dəqiqəlik müsahibə təşkil etmək istərdik. Uyğun tarixi bildirsəniz, minnətdar olarıq.",
      inquiryTypeLabel: "Mətbuat & Müsahibə",
      receivedAtLabel: "19 Noyabr 2024 • 11:02",
      status: "answered",
    },
    {
      id: "msg-4",
      fullName: "Səbinə Hacıyeva",
      contact: "sebine.h@example.com",
      subject: "Təşəkkür",
      message:
        "Stress və ürək sağlamlığı haqqında məqaləniz üçün təşəkkür edirəm. 4-7-8 tənəffüs təcrübəsi çox kömək etdi.",
      inquiryTypeLabel: "Ümumi Məlumat",
      receivedAtLabel: "18 Noyabr 2024 • 20:30",
      status: "read",
    },
  ];
}

function seedSubscribers(): Subscriber[] {
  const emails = [
    "aysel.mammadova@example.com",
    "tural.h@example.com",
    "gunel.ismayilova@example.com",
    "rauf.bayramov@example.com",
    "leyla.q@example.com",
    "murad.aliyev@example.com",
    "nezrin.s@example.com",
    "orxan.veliyev@example.com",
  ];
  const dates = [
    "22 Noyabr 2024",
    "20 Noyabr 2024",
    "18 Noyabr 2024",
    "15 Noyabr 2024",
    "12 Noyabr 2024",
    "08 Noyabr 2024",
    "03 Noyabr 2024",
    "28 Oktyabr 2024",
  ];
  return emails.map((email, i) => ({
    id: `sub-${i + 1}`,
    email,
    subscribedAtLabel: dates[i],
    isActive: i !== 5,
  }));
}

/* --------------------------------------------------------------
 * Anbar
 * ------------------------------------------------------------ */

interface Store {
  articles: AdminArticle[];
  categories: Category[];
  comments: AdminComment[];
  messages: ContactMessage[];
  subscribers: Subscriber[];
  videos: VideoItem[];
  protocols: ProtocolDocument[];
  faq: FaqItem[];
  channels: ContactChannel[];
  office: OfficeLocation;
  doctor: DoctorProfile;
  settings: SiteSettings;
}

/**
 * Dev-də hot reload modulu yenidən yükləyir — dəyişiklikləri saxlamaq üçün
 * anbar `globalThis` üzərində saxlanılır.
 */
const globalStore = globalThis as unknown as { __drStore?: Store };

export const store: Store =
  globalStore.__drStore ??
  (globalStore.__drStore = {
    articles: seedArticles(),
    categories: [...mockCategories],
    comments: seedComments(),
    messages: seedMessages(),
    subscribers: seedSubscribers(),
    videos: [...mockVideos],
    protocols: [...mockProtocols],
    faq: [...mockFaq],
    channels: [...mockContactChannels],
    office: { ...mockOffice },
    doctor: { ...mockDoctor },
    settings: { ...DEFAULT_SETTINGS },
  });

/** Yeni id yaradır */
export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* slugify `lib/utils`-ə köçürüldü — publik səhifələr də işlədir və bu fayl
 * (mock data anbarı) onlara qoşulmasın deyə. Köhnə idxallar üçün re-export. */
export { slugify } from "@/lib/utils";
