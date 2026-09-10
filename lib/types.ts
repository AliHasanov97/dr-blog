/**
 * Domain modelləri.
 * Bu tiplər həm mock data, həm də gələcək C# API cavabları üçün müqavilədir.
 * Backend hazır olanda yalnız `lib/api/*` faylları dəyişəcək — komponentlər yox.
 */

/* ---------------------------------------------------------------
 * Ümumi
 * ------------------------------------------------------------- */

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResult<T> {
  data: T;
  success: boolean;
  message?: string;
}

/* ---------------------------------------------------------------
 * Taksonomiya
 * ------------------------------------------------------------- */

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Material Symbols ikon adı */
  icon?: string;
  articleCount?: number;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

/* ---------------------------------------------------------------
 * Müəllif
 * ------------------------------------------------------------- */

export interface Author {
  id: string;
  fullName: string;
  title: string;
  avatarUrl: string;
  isVerified: boolean;
}

/* ---------------------------------------------------------------
 * Məqalə
 * ------------------------------------------------------------- */

export type ArticleBadgeTone = "secondary" | "tertiary" | "neutral" | "error";

export interface ArticleBadge {
  label: string;
  icon?: string;
  tone?: ArticleBadgeTone;
}

/** Məqalə gövdəsinin blok tipləri — redaktor JSON-u kimi saxlanılır */
export type ArticleBlock =
  | { type: "lead"; text: string; align?: TextAlign; lineHeight?: string }
  | {
      type: "heading";
      id: string;
      index: string;
      text: string;
      align?: TextAlign;
      lineHeight?: string;
    }
  | { type: "paragraph"; text: string; align?: TextAlign; lineHeight?: string }
  | {
      type: "quote";
      label: string;
      text: string;
      attribution?: string;
      icon?: string;
    }
  | {
      type: "checklist";
      intro?: string;
      items: { title: string; description: string }[];
    }
  | {
      /** Nöqtəli siyahı */
      type: "bulletList";
      items: string[];
    }
  | {
      /** Nömrəli siyahı */
      type: "orderedList";
      items: string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      /**
       * Şəklin mətnə görə yerləşməsi.
       * `left`/`right` — şəkil mətnin içinə yerləşir və mətn yanından axır
       * (mobil ekranda hər zaman tam en). Boş qalsa `full` sayılır.
       */
      align?: ImageAlign;
      /**
       * Şəklin eni faizlə (20–100). Yalnız `align` `full` olmayanda tətbiq
       * olunur. Boş qalsa 50 sayılır.
       */
      width?: number;
    }
  | {
      /** Slayd — bir neçə şəkil, oxucu sağa-sola sürüşdürür */
      type: "slider";
      intro?: string;
      items: SlideItem[];
      align?: ImageAlign;
      /** Slaydın eni faizlə (20–100) */
      width?: number;
    }
  | {
      /** YouTube videosu */
      type: "video";
      videoId: string;
      caption?: string;
      /** Mətnə görə yerləşmə — şəkillə eyni qaydalar */
      align?: ImageAlign;
      /** Videonun eni faizlə (20–100) */
      width?: number;
    }
  | {
      /** Oxucunun endirə biləcəyi fayl (PDF, DOC, XLS) */
      type: "file";
      url: string;
      /** Kartda görünən ad */
      title: string;
      /** «PDF», «DOCX» — ikonun altında yazılır */
      extension?: string;
      sizeLabel?: string;
      description?: string;
    }
  | {
      /** Cədvəl — HTML formatında saxlanılır */
      type: "table";
      /** Cədvəlin tam HTML-i */
      html: string;
    }
  | {
      /** Kod bloku */
      type: "codeBlock";
      code: string;
      language?: string;
    }
  | {
      /** Üfüqi xətt */
      type: "horizontalRule";
    };

/** Mətnin sətir düzləndirilməsi */
export type TextAlign = "left" | "center" | "right" | "justify";

export type ImageAlign = "full" | "left" | "right" | "center";

/** Media blokunun icazə verilən en aralığı (faiz) */
export const MEDIA_MIN_WIDTH = 20;
export const MEDIA_MAX_WIDTH = 100;
export const MEDIA_DEFAULT_WIDTH = 50;

/** Slayd bloku içindəki bir şəkil */
export interface SlideItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface ArticleReference {
  id: string;
  source: string;
  description: string;
}

export interface TableOfContentsItem {
  id: string;
  index: string;
  title: string;
}

/** Siyahılarda istifadə olunan yüngül forma */
export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  coverImageUrl?: string;
  publishedAt: string;
  publishedAtLabel: string;
  readMinutes: number;
  referenceCount?: number;
  referenceLabel?: string;
  viewCount?: number;
  isFeatured?: boolean;
  isPeerReviewed?: boolean;
  badges?: ArticleBadge[];
  tags?: string[];
  author: Author;
  /** Kart üzərində göstərilən qısa həkim şərhi */
  doctorNote?: string;
}

/** Detal səhifəsi üçün tam forma */
export interface Article extends ArticleSummary {
  /** Bu məqaləyə şərh yazılmasına icazə (admin panelindən idarə olunur) */
  allowComments?: boolean;
  heroImageUrl?: string;
  heroCaption?: string;
  journalLabel?: string;
  verificationNote?: string;
  tableOfContents: TableOfContentsItem[];
  blocks: ArticleBlock[];
  references: ArticleReference[];
  likeCount: number;
  commentCount: number;
}

/* ---------------------------------------------------------------
 * Şərhlər
 * ------------------------------------------------------------- */

export interface Comment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  authorAvatarUrl?: string;
  isAuthorVerified?: boolean;
  isDoctorReply?: boolean;
  createdAtLabel: string;
  body: string;
  likeCount: number;
  replies?: Comment[];
}

/* ---------------------------------------------------------------
 * Əlavə kontent tipləri
 * ------------------------------------------------------------- */

export interface TopReadArticle {
  rank: string;
  slug: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  readCountLabel: string;
  rating: number;
  ratingCount: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  kindLabel: string;
  url: string;
}

export interface ProtocolDocument {
  id: string;
  title: string;
  description: string;
  fileSizeLabel: string;
  fileUrl: string;
}

/* ---------------------------------------------------------------
 * Həkim profili
 * ------------------------------------------------------------- */

export interface DoctorStat {
  value: string;
  label: string;
}

export interface Credential {
  icon: string;
  label: string;
}

export interface TimelineEntry {
  id: string;
  period: string;
  institution: string;
  description: string;
}

export interface ResearchArea {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface SocialLink {
  id: string;
  icon: string;
  platform: string;
  handle?: string;
  description: string;
  url: string;
}

export interface DoctorProfile {
  fullName: string;
  shortTitle: string;
  fullTitle: string;
  avatarUrl: string;
  portraitUrl: string;
  isVerified: boolean;
  tagline: string;
  biography: string;
  quote: string;
  credentials: Credential[];
  stats: DoctorStat[];
  education: TimelineEntry[];
  researchAreas: ResearchArea[];
  socialLinks: SocialLink[];
}

/* ---------------------------------------------------------------
 * Əlaqə
 * ------------------------------------------------------------- */

export type ContactChannelKind = "whatsapp" | "email" | "phone";

export interface ContactChannel {
  id: string;
  kind: ContactChannelKind;
  icon: string;
  title: string;
  subtitle: string;
  values: string[];
  actionLabel: string;
  actionIcon: string;
  href: string;
}

export interface OfficeLocation {
  name: string;
  department: string;
  addressLine: string;
  room: string;
  city: string;
  shortAddress: string;
  mapUrl: string;
  mapImageUrl: string;
  schedule: { day: string; hours: string; isClosed?: boolean }[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type InquiryType =
  | "scientific"
  | "collaboration"
  | "press"
  | "general";

export interface ContactFormValues {
  inquiryType: InquiryType;
  fullName: string;
  contact: string;
  subject: string;
  message: string;
  consent: boolean;
}

export interface ContactFormErrors {
  fullName?: string;
  contact?: string;
  subject?: string;
  message?: string;
  consent?: string;
}

/* ---------------------------------------------------------------
 * Bülleten
 * ------------------------------------------------------------- */

export interface NewsletterSubscription {
  email: string;
}

/* ---------------------------------------------------------------
 * Axtarış
 * ------------------------------------------------------------- */

/** Header axtarışı üçün yüngül indeks elementi */
export interface SearchIndexItem {
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  readMinutes: number;
  tags?: string[];
}
