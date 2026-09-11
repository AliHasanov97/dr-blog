import { PrismaClient, ArticleStatus, CommentStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Mock data imports are inline since we can't import from @/ in seed
const mockCategories = [
  { id: "cat-cardio", slug: "kardiologiya", name: "Kardiologiya", icon: "monitor_heart" },
  { id: "cat-prevention", slug: "profilaktika", name: "Profilaktika", icon: "favorite" },
  { id: "cat-pressure", slug: "tezyiq-ve-aritmiya", name: "Təzyiq & Aritmiya", icon: "ecg" },
  { id: "cat-lifestyle", slug: "diyet-ve-heyat-terzi", name: "Diyet & Həyat Tərzi", icon: "restaurant" },
  { id: "cat-video", slug: "video-dersler", name: "Video Dərslər", icon: "smart_display" },
  { id: "cat-research", slug: "elmi-nesrler", name: "Elmi Nəşrlər (AHA/ESC)", icon: "science" },
];

const mockDoctor = {
  fullName: "Dr. Ələkbər Zeynili",
  shortTitle: "T.e.n., Kardioloq & Terapevt",
  fullTitle: "Tibb Elmləri Namizədi (Ph.D.) • Kardioloq-Aritmoloq & Elmi Tədqiqatçı",
  avatarUrl: "/images/doctor-avatar.svg",
  portraitUrl: "/images/doctor-portrait.svg",
  isVerified: true,
  tagline: "18+ İl Təcrübə • 48 Elmi Məqalə",
  biography: "Təbabət yalnız müalicə deyil, həm də xəstəliyin kökünü anlamaq və elmi əsaslarla pasiyenti maarifləndirmək sənətidir. 2006-cı ildən etibarən ürək-damar xəstəliklərinin erkən diaqnostikası, aritmiyaların dərman və kateter terapiyası, habelə arterial hipertoniyanın müasir protokollarla idarə olunması üzrə elmi və praktik fəaliyyət göstərirəm.",
  quote: "Sağlam ürək – düşünülmüş həyat tərzinin və elmi əsaslı profilaktikanın nəticəsidir.",
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
    { id: "edu-1", period: "2000 – 2006", institution: "Azərbaycan Tibb Universiteti", description: "Müalicə-profilaktika fakültəsi (Fərqlənmə diplomu)" },
    { id: "edu-2", period: "2006 – 2009", institution: "Hacettepe Universiteti Xəstəxanası (Türkiyə)", description: "Kardiologiya kafedrası – Rezidentura və aritmologiya ixtisaslaşması" },
    { id: "edu-3", period: "2012 – 2016", institution: "Tibb Elmləri Namizədliyi Dissertasiyası", description: "«İşemik ürək xəstəliyində mikrodamar disfunksiyasının proqnostik əhəmiyyəti»" },
    { id: "edu-4", period: "2019 – Hazırda", institution: "ESC & AHA Həqiqi Üzvü", description: "Avropa Kardiologiya Cəmiyyəti və Amerika Ürək Assosiasiyasında kliniki rəyçi" },
  ],
  researchAreas: [
    { id: "ra-1", icon: "monitor_heart", title: "Ürək ritm pozğunluqları və aritmiyalar", description: "Səyrici aritmiya, ekstrasistoliya və radiofrekans ablasiyası protokolları" },
    { id: "ra-2", icon: "speed", title: "Rezistent arterial hipertoniya", description: "Çətin korreksiya olunan qan təzyiqinin kombinə terapiyası" },
    { id: "ra-3", icon: "bloodtype", title: "Aterosklerozun profilaktikası & Kalsium skorinqi", description: "Damar divarının erkən kalsinozunun risk dəyərləndirilməsi" },
    { id: "ra-4", icon: "medication", title: "Ürək çatışmazlığının innovativ müalicəsi", description: "SGLT2 inhibitorları və müasir neyrohormonal blokada" },
    { id: "ra-5", icon: "directions_run", title: "Həyat tərzi kardiologiyası & İdman təbabəti", description: "Təhlükəsiz aerobik kardio-məşq yükü və qidalanma dəstəyi" },
  ],
  socialLinks: [
    { id: "sl-instagram", icon: "photo_camera", platform: "Instagram", handle: "@dr.narmin.aliyeva", description: "Gündəlik maarifləndirici video çarxlar və qeydlər", url: "https://instagram.com" },
    { id: "sl-youtube", icon: "smart_display", platform: "YouTube (CardioTalk)", handle: "CardioTalk", description: "15+ dəqiqəlik dərin vebinarlar və podkastlar", url: "https://youtube.com" },
    { id: "sl-telegram", icon: "send", platform: "Telegram (KardioKanal)", handle: "@kardiokanal", description: "Elmi xülasələr və faydalı PDF bələdçilər", url: "https://telegram.org" },
    { id: "sl-linkedin", icon: "work", platform: "LinkedIn", handle: "Dr. Narmin Aliyeva", description: "Elmi konfranslar və beynəlxalq əməkdaşlıq", url: "https://linkedin.com" },
    { id: "sl-researchgate", icon: "biotech", platform: "ResearchGate Portalı", description: "48 elmi məqalə, sitat indeksləri və pre-printlər", url: "https://researchgate.net" },
  ],
};

const mockContactChannels = [
  {
    id: "ch-whatsapp",
    kind: "whatsapp",
    icon: "chat",
    title: "WhatsApp Məlumat Xətti",
    subtitle: "Koordinasiya & Sürətli cavab",
    values: ["+994 50 200 00 00"],
    actionLabel: "WhatsApp ilə Yazın",
    actionIcon: "send",
    href: "https://wa.me/994502000000",
    sortOrder: 0,
  },
  {
    id: "ch-email",
    kind: "email",
    icon: "alternate_email",
    title: "Rəsmi & Elmi E-poçt",
    subtitle: "Akademik müzakirələr və mətbuat",
    values: ["dr.narmin@kardiologiya.az", "elmi.elaqe@drnarmin.az"],
    actionLabel: "E-poçt Göndər",
    actionIcon: "mail",
    href: "mailto:elmi.elaqe@drnarmin.az",
    sortOrder: 1,
  },
  {
    id: "ch-phone",
    kind: "phone",
    icon: "call",
    title: "Telefon / Zəng Xətti",
    subtitle: "Katiblik və ümumi sorğular",
    values: ["+994 12 490 00 00"],
    actionLabel: "Birbaşa Zəng Edin",
    actionIcon: "phone_in_talk",
    href: "tel:+994124900000",
    sortOrder: 2,
  },
];

const mockOffice = {
  name: "Mərkəzi Klinika",
  department: "Kardiologiya və Aritmologiya Şöbəsi",
  addressLine: "Bakı şəhəri, Səbail rayonu, Parlament prospekti 76 (Elmlər Akademiyası metrosunun yaxınlığı)",
  shortAddress: "Parlament prospekti 76, Bakı",
  room: "3-cü mərtəbə, Otaq 314",
  city: "Bakı Şəhəri",
  mapUrl: "https://maps.google.com/?q=Parlament+prospekti+76+Baku",
  mapImageUrl: "/images/map-baku.svg",
  schedule: [
    { day: "Bazar ertəsi – Cümə", hours: "09:00 – 17:30" },
    { day: "Şənbə günü", hours: "10:00 – 15:00" },
    { day: "Bazar günü", hours: "Qeyri-iş günü", isClosed: true },
  ],
  sortOrder: 0,
};

const mockFaq = [
  { id: "faq-1", question: "Həkimə sualları birbaşa necə ünvanlaya bilərəm?", answer: "Akademik suallar, məqalə rəyləri və ümumi sorğular üçün müraciət formasını doldura və ya rəsmi e-poçt ünvanına yaza bilərsiniz. Həkim təqvim sıxlığına uyğun olaraq məktubları şəxsən nəzərdən keçirir.", sortOrder: 0 },
  { id: "faq-2", question: "Məqalələr üzrə şəxsi analizlərimi göndərə bilərəmmi?", answer: "Bəli, nəşr edilmiş klinik təhlillərlə bağlı oxucu müzakirəsi məqsədilə epikriz və ya EKQ fraqmentlərini forma vasitəsilə anonimləşdirərək göndərə bilərsiniz.", sortOrder: 1 },
  { id: "faq-3", question: "Konfrans və elmi tədbirlərdə spikerlik üçün müraciət qaydası necədir?", answer: "Beynəlxalq və yerli konfrans təşkilatçıları tədbir proqramı, mövzu çərçivəsi və tarixi göstərilməklə birbaşa elmi.elaqe@drnarmin.az ünvanına rəsmi dəvət məktubu göndərə bilərlər.", sortOrder: 2 },
];

const mockVideos = [
  { id: "vid-1", title: "EKQ-də ST Seqmentinin Elevasiyası və Diferensial Diaqnostika", description: "Perikardit, Berk və STEMI ayırıcı cizgiləri.", thumbnailUrl: "/images/video-ekg.svg", videoUrl: "#", kindLabel: "Klinik Vebinar", sortOrder: 0 },
  { id: "vid-2", title: "Evdə Təzyiqi Düzgün Ölçməyin 5 Qızıl Qaydası", description: "Tonometr manjetinin seçilməsi və postur səhvləri.", thumbnailUrl: "/images/video-tonometr.svg", videoUrl: "#", kindLabel: "Pasiyent İzahı", sortOrder: 1 },
];

const mockProtocols = [
  { id: "pdf-1", title: "ESC 2024 Arterial Hipertenziya Rəhbərliyi", description: "Hədəf təzyiq göstəriciləri və kombinə dərman sxemləri", fileSizeLabel: "2.4 MB", fileUrl: "#", sortOrder: 0 },
  { id: "pdf-2", title: "Səyrici Aritmiyada Antikoaqulyant Protokolu", description: "CHA2DS2-VASc şkalası və NOAK dozalanma cədvəli", fileSizeLabel: "1.8 MB", fileUrl: "#", sortOrder: 1 },
];

const mockUsers = [
  { email: "admin@drnarmin.az", password: "Admin123!", fullName: "Dr. Ələkbər Zeynili", role: UserRole.ADMIN, avatarUrl: "/images/doctor-avatar.svg" },
  { email: "redaktor@drnarmin.az", password: "Redaktor123!", fullName: "Aygün Məmmədova", role: UserRole.EDITOR },
];

// Articles data
const mockArticles = [
  {
    id: "art-001",
    slug: "urek-saglamligi-ve-gundelik-stress",
    title: "Ürək Sağlamlığı və Gündəlik Stress: 2024-cü il Kliniki Protokolları və Praktiki Məsləhətlər",
    excerpt: "Xroniki nevrozların və emosional gərginliyin miokard perfuziyasına təsiri: Müasir kardiologiyada holistik yanaşma və mikrosirkulyasiyanın bərpası üzrə beynəlxalq protokollar.",
    categorySlug: "kardiologiya",
    coverImageUrl: "/images/article-stress.svg",
    heroImageUrl: "/images/article-stress.svg",
    publishedAt: new Date("2024-11-14"),
    viewCount: 4820,
    isFeatured: true,
    isPeerReviewed: true,
    likeCount: 142,
    tableOfContents: [
      { id: "bolme-1", index: "01", title: "Xroniki stress ürək damarlarına necə təsir edir?" },
      { id: "bolme-2", index: "02", title: "Həkimin tövsiyəsi və qan dövranı balansı" },
      { id: "bolme-3", index: "03", title: "Qan təzyiqi dalğalanmalarının qarşısını alan 5 qızıl qayda" },
      { id: "bolme-4", index: "04", title: "ESC 2024 Qaydaları və elmi istinadlar" },
    ],
    blocks: [
      { type: "lead", text: "Müasir kardiologiya tək bir orqanı deyil, bütün sinir-damar oxunu araşdırır. Uzunmüddətli psixo-emosional gərginlik endotel qatının elastikliyini itirməsinə gətirib çıxaran ən başlıca patogen faktorlardan biridir." },
      { type: "heading", id: "bolme-1", index: "1", text: "Xroniki stress ürək damarlarına necə təsir edir?" },
      { type: "paragraph", text: "Gündəlik tələskənlik və informasiya yükü böyrəküstü vəzilərin kortizol və katexolamin ifrazını fasiləsiz aktivləşdirir. Bu hormonların xroniki konsentrasiyası miokardın oksigen tələbatını artırır və periferik mikrosirkulyasiyanı zəiflədir." },
    ],
    references: [
      { id: "ref-1", source: "European Heart Journal (2024)", description: "Guidelines for the management of arterial hypertension and cardiovascular risk factor optimization." },
      { id: "ref-2", source: "World Health Organization (Cardiovascular Series, 2023)", description: "Non-communicable diseases: Physical activity and vascular compliance benchmarks." },
    ],
  },
  {
    id: "art-002",
    slug: "muasir-dovrun-infarkt-tehlukeleri",
    title: "Müasir Dövrün İnfarkt Təhlükələri: Gizli Əlamətlər və İlkin Yardım",
    excerpt: "Klassik sinə ağrısı hər zaman infarktın ilk xəbərdarlığı olmur. Xüsusilə gənc və qadın pasiyentlərdə atipik simptomlar, qan dövranı dalğalanmaları və dəqiqələrin həyati əhəmiyyəti.",
    categorySlug: "kardiologiya",
    coverImageUrl: "/images/article-infarkt.svg",
    heroImageUrl: "/images/article-infarkt.svg",
    publishedAt: new Date("2024-11-18"),
    viewCount: 4820,
    isFeatured: true,
    isPeerReviewed: true,
    likeCount: 210,
    tableOfContents: [
      { id: "inf-1", index: "01", title: "Atipik simptomlar niyə gözdən qaçır?" },
      { id: "inf-2", index: "02", title: "İlk 90 dəqiqənin qızıl qaydası" },
      { id: "inf-3", index: "03", title: "Evdə ilkin yardım addımları" },
    ],
    blocks: [
      { type: "lead", text: "Miokard infarktının klassik təsviri — sol qola yayılan sıxıcı sinə ağrısı — pasiyentlərin təxminən üçdə birində müşahidə olunmur. Bu, xüsusilə qadınlarda və diabetli pasiyentlərdə diaqnozun gecikməsinə səbəb olur." },
      { type: "heading", id: "inf-1", index: "1", text: "Atipik simptomlar niyə gözdən qaçır?" },
      { type: "paragraph", text: "Ürəkbulanma, kürək nahiyəsində küt ağrı, izaholunmaz yorğunluq və soyuq tərləmə çox vaxt mədə problemi və ya sadəcə yorğunluq kimi qiymətləndirilir." },
    ],
    references: [
      { id: "ref-1", source: "ESC Clinical Practice Guidelines (2023)", description: "Acute Coronary Syndromes: diagnosis and reperfusion timing recommendations." },
    ],
  },
  {
    id: "art-003",
    slug: "arterial-tezyiqin-idare-edilmesi",
    title: "Arterial Təzyiqin İdarə Edilməsi: Duz Qəbulu və Natrium-Kalium Nisbətinin Əhəmiyyəti",
    excerpt: "Son kardiologiya araşdırmaları göstərir ki, təkcə natriumu məhdudlaşdırmaq kifayət deyil — hüceyrədaxili kalium konsentrasiyası da tarazlaşdırılmalıdır.",
    categorySlug: "tezyiq-ve-aritmiya",
    coverImageUrl: "/images/article-tezyiq.svg",
    publishedAt: new Date("2024-11-08"),
    viewCount: 3120,
    isPeerReviewed: true,
    likeCount: 88,
    tableOfContents: [
      { id: "tz-1", index: "01", title: "Natrium tək günahkar deyil" },
      { id: "tz-2", index: "02", title: "Praktik rasion dəyişiklikləri" },
    ],
    blocks: [
      { type: "lead", text: "Arterial hipertoniyanın qidalanma vasitəsilə korreksiyası yalnız duzun azaldılmasına yönəldikdə effekt gözləniləndən zəif olur." },
      { type: "heading", id: "tz-1", index: "1", text: "Natrium tək günahkar deyil" },
      { type: "paragraph", text: "Hüceyrədaxili kalium ehtiyatı azaldıqda natrium-kalium nasosunun işi pozulur və damar divarının hamar əzələ hüceyrələri artıq tonusda qalır." },
    ],
    references: [
      { id: "ref-1", source: "ESC/ESH Guidelines (2023)", description: "Management of arterial hypertension — dietary sodium targets." },
    ],
  },
];

// Comments data
const mockComments = [
  {
    articleSlug: "urek-saglamligi-ve-gundelik-stress",
    authorName: "Elmir Məmmədov",
    authorRole: "Pasiyent",
    body: "Doktor, çox təşəkkürlər ətraflı məqalə üçün. Xroniki stress zamanı səhər tezdən qəhvə qəbulu taxikardiyanı (ürək döyüntüsünü) kəskinləşdirə bilərmi?",
    likeCount: 12,
  },
  {
    articleSlug: "urek-saglamligi-ve-gundelik-stress",
    authorName: "Leyla Qasımova",
    authorRole: "Oxucu",
    body: "5 qızıl qaydadakı 4-7-8 tənəffüs təcrübəsini təzyiq dalğalanması hiss edəndə tətbiq etdim, həqiqətən də nəbzi 5-7 dəqiqə ərzində stabilləşdirir.",
    likeCount: 8,
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.contactChannel.deleteMany();
  await prisma.officeLocation.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.video.deleteMany();
  await prisma.protocolDocument.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  console.log("Creating categories...");
  for (const cat of mockCategories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
      },
    });
  }

  // Create articles
  console.log("Creating articles...");
  for (const art of mockArticles) {
    const category = mockCategories.find(c => c.slug === art.categorySlug);
    if (!category) continue;

    await prisma.article.create({
      data: {
        id: art.id,
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt,
        status: ArticleStatus.PUBLISHED,
        coverImageUrl: art.coverImageUrl,
        heroImageUrl: art.heroImageUrl,
        publishedAt: art.publishedAt,
        viewCount: art.viewCount,
        likeCount: art.likeCount,
        isFeatured: art.isFeatured || false,
        isPeerReviewed: art.isPeerReviewed || false,
        tableOfContents: art.tableOfContents,
        blocks: art.blocks,
        references: art.references,
        categoryId: category.id,
      },
    });
  }

  // Create comments
  console.log("Creating comments...");
  for (const comment of mockComments) {
    const article = mockArticles.find(a => a.slug === comment.articleSlug);
    if (!article) continue;

    await prisma.comment.create({
      data: {
        authorName: comment.authorName,
        authorRole: comment.authorRole,
        body: comment.body,
        likeCount: comment.likeCount,
        status: CommentStatus.APPROVED,
        articleId: article.id,
      },
    });
  }

  // Create doctor profile
  console.log("Creating doctor profile...");
  await prisma.doctorProfile.create({
    data: {
      fullName: mockDoctor.fullName,
      shortTitle: mockDoctor.shortTitle,
      fullTitle: mockDoctor.fullTitle,
      avatarUrl: mockDoctor.avatarUrl,
      portraitUrl: mockDoctor.portraitUrl,
      isVerified: mockDoctor.isVerified,
      tagline: mockDoctor.tagline,
      biography: mockDoctor.biography,
      quote: mockDoctor.quote,
      credentials: mockDoctor.credentials,
      stats: mockDoctor.stats,
      education: mockDoctor.education,
      researchAreas: mockDoctor.researchAreas,
      socialLinks: mockDoctor.socialLinks,
    },
  });

  // Create contact channels
  console.log("Creating contact channels...");
  for (const channel of mockContactChannels) {
    await prisma.contactChannel.create({
      data: {
        id: channel.id,
        kind: channel.kind,
        icon: channel.icon,
        title: channel.title,
        subtitle: channel.subtitle,
        values: channel.values,
        actionLabel: channel.actionLabel,
        actionIcon: channel.actionIcon,
        href: channel.href,
        sortOrder: channel.sortOrder,
      },
    });
  }

  // Create office location
  console.log("Creating office location...");
  await prisma.officeLocation.create({
    data: {
      name: mockOffice.name,
      department: mockOffice.department,
      addressLine: mockOffice.addressLine,
      room: mockOffice.room,
      city: mockOffice.city,
      shortAddress: mockOffice.shortAddress,
      mapUrl: mockOffice.mapUrl,
      mapImageUrl: mockOffice.mapImageUrl,
      schedule: mockOffice.schedule,
      sortOrder: mockOffice.sortOrder,
    },
  });

  // Create FAQ items
  console.log("Creating FAQ items...");
  for (const faq of mockFaq) {
    await prisma.faqItem.create({
      data: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
      },
    });
  }

  // Create videos
  console.log("Creating videos...");
  for (const video of mockVideos) {
    await prisma.video.create({
      data: {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        kindLabel: video.kindLabel,
        sortOrder: video.sortOrder,
      },
    });
  }

  // Create protocol documents
  console.log("Creating protocol documents...");
  for (const protocol of mockProtocols) {
    await prisma.protocolDocument.create({
      data: {
        id: protocol.id,
        title: protocol.title,
        description: protocol.description,
        fileSizeLabel: protocol.fileSizeLabel,
        fileUrl: protocol.fileUrl,
        sortOrder: protocol.sortOrder,
      },
    });
  }

  // Create users
  console.log("Creating users...");
  for (const user of mockUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: hashedPassword,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: true,
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
