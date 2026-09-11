import type {
  ProtocolDocument,
  TopReadArticle,
  VideoItem,
} from "@/lib/types";

/** Bloq səhifəsi — «Ən Çox Oxunanlar» */
export const mockTopRead: TopReadArticle[] = [
  {
    rank: "#01",
    slug: "aterosklerozun-ilkin-elametleri",
    title: "Aterosklerozun ilkin əlamətləri və damar kalsifikasiyası",
    excerpt: "Kalsium skorinqi və koronar angioqrafiyanın profilaktik dəyəri.",
    readCountLabel: "12.4k oxu",
  },
  {
    rank: "#02",
    slug: "gece-tezyiq-enmesi-ve-insult-riski",
    title: "Gecə təzyiq enməsi (Dipping) və insult riski",
    excerpt: "Non-dipper pasiyentlərdə xronoterapiya protokolları və tövsiyələr.",
    readCountLabel: "9.8k oxu",
  },
  {
    rank: "#03",
    slug: "maqnezium-ve-kalium",
    title: "Maqnezium və kalium: Ürək ritmində hansı formalar təsirlidir?",
    excerpt: "Sitrat, bisqlisinat və taurat formalarının biomənimsənilməsi.",
    readCountLabel: "8.1k oxu",
  },
];

/** Bloq səhifəsi — CardioTalk video bölməsi */
export const mockVideos: VideoItem[] = [
  {
    id: "vid-1",
    title: "EKQ-də ST Seqmentinin Elevasiyası və Diferensial Diaqnostika",
    description: "Perikardit, Berk və STEMI ayırıcı cizgiləri.",
    thumbnailUrl: "/images/video-ekg.svg",
    kindLabel: "Klinik Vebinar",
    url: "#",
  },
  {
    id: "vid-2",
    title: "Evdə Təzyiqi Düzgün Ölçməyin 5 Qızıl Qaydası",
    description: "Tonometr manjetinin seçilməsi və postur səhvləri.",
    thumbnailUrl: "/images/video-tonometr.svg",
    kindLabel: "Pasiyent İzahı",
    url: "#",
  },
];

/** Bloq səhifəsi — Klinik protokollar (PDF) */
export const mockProtocols: ProtocolDocument[] = [
  {
    id: "pdf-1",
    title: "ESC 2024 Arterial Hipertenziya Rəhbərliyi",
    description: "Hədəf təzyiq göstəriciləri və kombinə dərman sxemləri",
    fileSizeLabel: "2.4 MB",
    fileUrl: "#",
  },
  {
    id: "pdf-2",
    title: "Səyrici Aritmiyada Antikoaqulyant Protokolu",
    description: "CHA2DS2-VASc şkalası və NOAK dozalanma cədvəli",
    fileSizeLabel: "1.8 MB",
    fileUrl: "#",
  },
];
