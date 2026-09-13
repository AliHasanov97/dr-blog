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
  /** Tərcümə açarı — `message` əvəzinə işlədiləndə çağıran tərəf lokal mesaja çevirir */
  code?: string;
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
      /**
       * Çərçivənin en:hündürlük nisbəti. Boş qalsa `align`-a görə təyin
       * olunur: `left`/`right` üçün 4:3, qalanları üçün 16:9 — köhnə
       * məqalələr bu sahə əlavə olunmazdan əvvəlki görünüşü saxlayır.
       */
      aspectRatio?: ImageAspectRatio;
      /**
       * Şəkil çərçivəyə necə sığsın.
       * `cover` — çərçivəni doldurur, kənarları kəsilə bilər (default).
       * `contain` — şəkil tam görünür, lazım gələrsə boşluq qalır.
       */
      fit?: ImageFit;
      /**
       * Kəsim zamanı hansı hissənin görünəcəyini təyin edir (`fit: "cover"`)
       * və ya `contain` olanda şəklin çərçivədə necə düzüləcəyini.
       * Boş qalsa mərkəz sayılır.
       */
      focus?: ImageFocus;
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
      /**
       * Şəkil cərgəsi — bir neçə şəkil eyni sətirdə, yan-yana (qalereya).
       * Slaydan fərqi: hamısı eyni anda görünür, sürüşdürmə yoxdur.
       */
      type: "imageGroup";
      items: SlideItem[];
      /**
       * Bir sətirdə sütun sayı (1–4). Boş qalsa şəkil sayına görə təyin
       * olunur (ən çox 4) — mobil ekranda həmişə 2 sütuna düşür.
       */
      columns?: 1 | 2 | 3 | 4;
      /** Bütün xanalar üçün ortaq nisbət. Boş qalsa 1:1 (kvadrat). */
      aspectRatio?: ImageAspectRatio;
      /** Bütün xanalar üçün ortaq sığma. Boş qalsa `cover`. */
      fit?: ImageFit;
      /** Mətnə görə yerləşmə — digər media blokları ilə eyni qaydalar */
      align?: ImageAlign;
      /** Cərgənin ümumi eni faizlə (20–100) — kənardakı tutacaqla dəyişilir */
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
      /**
       * PDF olduqda oxucuya nə təklif olunur. Boş qalsa `"download"` sayılır.
       *  - `download` — yalnız endirmə kartı (əvvəlki tək davranış)
       *  - `read`     — yalnız səhifədə oxumaq, endirmə linki göstərilmir
       *  - `both`     — endirmə kartı və altında səhifədə oxuma birlikdə
       */
      access?: "download" | "read" | "both";
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

/**
 * Şəkil çərçivəsinin en:hündürlük nisbəti.
 *
 * Onluq ədəd kimi mətn saxlanılır (məs. `"1.7778"` = 16:9, `"1"` = 1:1) —
 * sabit siyahı ilə məhdudlaşmır, çünki oxucu redaktorda çərçivənin
 * hündürlüyünü siçanla sərbəst dartıb dəyişə bilir. Hazır düymələr
 * (16:9, 4:3 və s.) sadəcə bu dəyəri qısayoldan təyin edir.
 */
export type ImageAspectRatio = string;

/** Şəklin çərçivəyə sığma qaydası (CSS `object-fit`) */
export type ImageFit = "cover" | "contain";

/** Kəsim/düzülüş fokus nöqtəsi (CSS `object-position`) — 3×3 tor */
export type ImageFocus =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

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
  referenceCount?: number;
  referenceLabel?: string;
  viewCount?: number;
  isFeatured?: boolean;
  isPeerReviewed?: boolean;
  author: Author;
}

/** Detal səhifəsi üçün tam forma */
export interface Article extends ArticleSummary {
  /** Bu məqaləyə şərh yazılmasına icazə (admin panelindən idarə olunur) */
  allowComments?: boolean;
  heroImageUrl?: string;
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
  readCountLabel: string;
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
  /**
   * PDF olduqda oxucuya nə təklif olunur. Boş qalsa `"download"` sayılır.
   *  - `download` — yalnız endirmə kartı
   *  - `read`     — yalnız səhifədə oxumaq, endirmə linki göstərilmir
   *  - `both`     — endirmə kartı və altında səhifədə oxuma birlikdə
   */
  access?: "download" | "read" | "both";
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
}
