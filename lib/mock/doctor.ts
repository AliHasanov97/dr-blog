import type { Author, DoctorProfile } from "@/lib/types";

export const mockDoctor: DoctorProfile = {
  fullName: "Dr. Nərmin Əliyeva",
  shortTitle: "T.e.n., Kardioloq & Terapevt",
  fullTitle:
    "Tibb Elmləri Namizədi (Ph.D.) • Kardioloq-Aritmoloq & Elmi Tədqiqatçı",
  avatarUrl: "/images/doctor-avatar.svg",
  portraitUrl: "/images/doctor-portrait.svg",
  isVerified: true,
  tagline: "18+ İl Təcrübə • 48 Elmi Məqalə",
  biography:
    "Təbabət yalnız müalicə deyil, həm də xəstəliyin kökünü anlamaq və elmi əsaslarla pasiyenti maarifləndirmək sənətidir. 2006-cı ildən etibarən ürək-damar xəstəliklərinin erkən diaqnostikası, aritmiyaların dərman və kateter terapiyası, habelə arterial hipertoniyanın müasir protokollarla idarə olunması üzrə elmi və praktik fəaliyyət göstərirəm.",
  quote:
    "Sağlam ürək – düşünülmüş həyat tərzinin və elmi əsaslı profilaktikanın nəticəsidir.",
  credentials: [
    { icon: "workspace_premium", label: "FESC (Avropa Kardiologiya Fəxri Üzvü)" },
    { icon: "stethoscope", label: "18+ İl Klinik Təcrübə" },
    { icon: "menu_book", label: "48 Resenziyalı Məqalə" },
  ],
  stats: [
    { value: "18+ İl", label: "Kliniki Təcrübə" },
    { value: "48", label: "Elmi Nəşr & Protokol" },
    { value: "14k+", label: "Sağlamlaşan Pasiyent" },
    { value: "120+", label: "Beynəlxalq Çıxış" },
  ],
  education: [
    {
      id: "edu-1",
      period: "2000 – 2006",
      institution: "Azərbaycan Tibb Universiteti",
      description: "Müalicə-profilaktika fakültəsi (Fərqlənmə diplomu)",
    },
    {
      id: "edu-2",
      period: "2006 – 2009",
      institution: "Hacettepe Universiteti Xəstəxanası (Türkiyə)",
      description:
        "Kardiologiya kafedrası – Rezidentura və aritmologiya ixtisaslaşması",
    },
    {
      id: "edu-3",
      period: "2012 – 2016",
      institution: "Tibb Elmləri Namizədliyi Dissertasiyası",
      description:
        "«İşemik ürək xəstəliyində mikrodamar disfunksiyasının proqnostik əhəmiyyəti»",
    },
    {
      id: "edu-4",
      period: "2019 – Hazırda",
      institution: "ESC & AHA Həqiqi Üzvü",
      description:
        "Avropa Kardiologiya Cəmiyyəti və Amerika Ürək Assosiasiyasında kliniki rəyçi",
    },
  ],
  researchAreas: [
    {
      id: "ra-1",
      icon: "monitor_heart",
      title: "Ürək ritm pozğunluqları və aritmiyalar",
      description:
        "Səyrici aritmiya, ekstrasistoliya və radiofrekans ablasiyası protokolları",
    },
    {
      id: "ra-2",
      icon: "speed",
      title: "Rezistent arterial hipertoniya",
      description: "Çətin korreksiya olunan qan təzyiqinin kombinə terapiyası",
    },
    {
      id: "ra-3",
      icon: "bloodtype",
      title: "Aterosklerozun profilaktikası & Kalsium skorinqi",
      description: "Damar divarının erkən kalsinozunun risk dəyərləndirilməsi",
    },
    {
      id: "ra-4",
      icon: "medication",
      title: "Ürək çatışmazlığının innovativ müalicəsi",
      description: "SGLT2 inhibitorları və müasir neyrohormonal blokada",
    },
    {
      id: "ra-5",
      icon: "directions_run",
      title: "Həyat tərzi kardiologiyası & İdman təbabəti",
      description: "Təhlükəsiz aerobik kardio-məşq yükü və qidalanma dəstəyi",
    },
  ],
  socialLinks: [
    {
      id: "sl-instagram",
      icon: "photo_camera",
      platform: "Instagram",
      handle: "@dr.narmin.aliyeva",
      description: "Gündəlik maarifləndirici video çarxlar və qeydlər",
      url: "https://instagram.com",
    },
    {
      id: "sl-youtube",
      icon: "smart_display",
      platform: "YouTube (CardioTalk)",
      handle: "CardioTalk",
      description: "15+ dəqiqəlik dərin vebinarlar və podkastlar",
      url: "https://youtube.com",
    },
    {
      id: "sl-telegram",
      icon: "send",
      platform: "Telegram (KardioKanal)",
      handle: "@kardiokanal",
      description: "Elmi xülasələr və faydalı PDF bələdçilər",
      url: "https://telegram.org",
    },
    {
      id: "sl-linkedin",
      icon: "work",
      platform: "LinkedIn",
      handle: "Dr. Narmin Aliyeva",
      description: "Elmi konfranslar və beynəlxalq əməkdaşlıq",
      url: "https://linkedin.com",
    },
    {
      id: "sl-researchgate",
      icon: "biotech",
      platform: "ResearchGate Portalı",
      description: "48 elmi məqalə, sitat indeksləri və pre-printlər",
      url: "https://researchgate.net",
    },
  ],
};

/**
 * Məqalələrin müəllif kartında göstərilən şəxs.
 *
 * Ayrıca Author cədvəli yoxdur — sayt bir həkimə aiddir, ona görə bu,
 * `mockDoctor`-dan hesablanır (real bazada `dbGetArticleAuthor` eyni işi
 * `DoctorProfile`-dan görür).
 */
export const mockAuthor: Author = {
  id: "doctor",
  fullName: mockDoctor.fullName,
  title: mockDoctor.shortTitle,
  avatarUrl: mockDoctor.avatarUrl ?? "",
  isVerified: mockDoctor.isVerified,
};
