import type { Article, Comment } from "@/lib/types";
import { mockAuthor } from "./doctor";
import { mockCategories } from "./categories";

const cat = (slug: string) =>
  mockCategories.find((c) => c.slug === slug) ?? mockCategories[0];

export const mockArticles: Article[] = [
  {
    id: "art-001",
    slug: "urek-saglamligi-ve-gundelik-stress",
    title:
      "Ürək Sağlamlığı və Gündəlik Stress: 2024-cü il Kliniki Protokolları və Praktiki Məsləhətlər",
    excerpt:
      "Xroniki nevrozların və emosional gərginliyin miokard perfuziyasına təsiri: Müasir kardiologiyada holistik yanaşma və mikrosirkulyasiyanın bərpası üzrə beynəlxalq protokollar.",
    category: cat("kardiologiya"),
    coverImageUrl: "/images/article-stress.svg",
    heroImageUrl: "/images/article-stress.svg",
    publishedAt: "2024-11-14",
    publishedAtLabel: "14 Noyabr 2024",
    referenceCount: 12,
    referenceLabel: "12 Elmi İstinad",
    viewCount: 4820,
    isFeatured: true,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 142,
    commentCount: 18,
    tableOfContents: [
      {
        id: "bolme-1",
        index: "01",
        title: "Xroniki stress ürək damarlarına necə təsir edir?",
      },
      {
        id: "bolme-2",
        index: "02",
        title: "Həkimin tövsiyəsi və qan dövranı balansı",
      },
      {
        id: "bolme-3",
        index: "03",
        title: "Qan təzyiqi dalğalanmalarının qarşısını alan 5 qızıl qayda",
      },
      {
        id: "bolme-4",
        index: "04",
        title: "ESC 2024 Qaydaları və elmi istinadlar",
      },
    ],
    blocks: [
      {
        type: "lead",
        text: "Müasir kardiologiya tək bir orqanı deyil, bütün sinir-damar oxunu araşdırır. Uzunmüddətli psixo-emosional gərginlik endotel qatının elastikliyini itirməsinə gətirib çıxaran ən başlıca patogen faktorlardan biridir.",
      },
      {
        type: "heading",
        id: "bolme-1",
        index: "1",
        text: "Xroniki stress ürək damarlarına necə təsir edir?",
      },
      {
        type: "paragraph",
        text: "Gündəlik tələskənlik və informasiya yükü böyrəküstü vəzilərin kortizol və katexolamin ifrazını fasiləsiz aktivləşdirir. Bu hormonların xroniki konsentrasiyası miokardın oksigen tələbatını artırır və periferik mikrosirkulyasiyanı zəiflədir.",
      },
      {
        type: "paragraph",
        text: "2024-cü ilin Avropa Kardiologiya Cəmiyyətinin (ESC) kliniki konsensusunda vurğulanır ki, arterial damar tonusunun disbalansı çox vaxt klinik simptom vermədən, mikro-iltihabi reaksiyalarla inkişaf edir.",
      },
      {
        type: "quote",
        label: "Həkimin tövsiyəsi",
        icon: "cardiology",
        text: "Gündə 30 dəqiqə fasiləsiz orta templi gəzinti ürək-damar xəstəlikləri riskini 35% azaldır. Fizioterapevtik hərəkət qan damarlarında azot-oksid (NO) sintezini təbii yolla stimullaşdırır.",
        attribution: "Dr. Nərmin Əliyeva, ESC Tədqiqat Qrupu",
      },
      {
        type: "heading",
        id: "bolme-3",
        index: "2",
        text: "Qan təzyiqi dalğalanmalarının qarşısını almaq üçün 5 qızıl qayda",
      },
      {
        type: "checklist",
        intro:
          "Pasiyentlərin gündəlik rejiminə tətbiq edə biləcəyi sübut olunmuş kliniki addımlar:",
        items: [
          {
            title: "Qidalanmada natrium azaldılması",
            description:
              "Süfrə duzunu sutkada 5 qramdan az saxlayın; işlənmiş qidalardan çəkinin.",
          },
          {
            title: "Fasiləli tənəffüs təcrübələri",
            description:
              "Gündə iki dəfə 4-7-8 ritmi ilə diafraqmal tənəffüs vagal tonusu gücləndirir.",
          },
          {
            title: "Daimi hidrasiya balansı",
            description:
              "Qanın reoloji xüsusiyyətlərini normada saxlamaq üçün hər kiloqrama 30 ml su qəbulu.",
          },
          {
            title: "Gecə yuxu gigiyenası",
            description:
              "Yatmazdan 1 saat əvvəl mavi ekranları məhdudlaşdırmaq simpatik sakitliyi təmin edir.",
          },
          {
            title: "Sistematik arterial monitorinq",
            description:
              "Həftədə ən azı üç dəfə sabit saatlarda təzyiqi qeyd edin və gündəlik aparın.",
          },
        ],
      },
      {
        type: "image",
        src: "/images/article-walking.svg",
        alt: "Parkda gəzinti",
        caption:
          "Təbii mühitdə gəzinti simpatik sinir sisteminin oyanıqlığını azaldır.",
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "European Heart Journal (2024)",
        description:
          "Guidelines for the management of arterial hypertension and cardiovascular risk factor optimization.",
      },
      {
        id: "ref-2",
        source: "World Health Organization (Cardiovascular Series, 2023)",
        description:
          "Non-communicable diseases: Physical activity and vascular compliance benchmarks.",
      },
      {
        id: "ref-3",
        source: "Azərbaycan Kardiologiya Jurnalı (Cild 14, 2024)",
        description:
          "Gərginlik tipli hipertonik reaksiyaların preventiv menecmenti: Bakı kliniki sınağı.",
      },
    ],
  },

  {
    id: "art-002",
    slug: "muasir-dovrun-infarkt-tehlukeleri",
    title: "Müasir Dövrün İnfarkt Təhlükələri: Gizli Əlamətlər və İlkin Yardım",
    excerpt:
      "Klassik sinə ağrısı hər zaman infarktın ilk xəbərdarlığı olmur. Xüsusilə gənc və qadın pasiyentlərdə atipik simptomlar, qan dövranı dalğalanmaları və dəqiqələrin həyati əhəmiyyəti.",
    category: cat("kardiologiya"),
    coverImageUrl: "/images/article-infarkt.svg",
    heroImageUrl: "/images/article-infarkt.svg",
    publishedAt: "2024-11-18",
    publishedAtLabel: "18 Noyabr 2024",
    referenceCount: 14,
    referenceLabel: "14 istinad",
    viewCount: 4820,
    isFeatured: true,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 210,
    commentCount: 26,
    tableOfContents: [
      { id: "inf-1", index: "01", title: "Atipik simptomlar niyə gözdən qaçır?" },
      { id: "inf-2", index: "02", title: "İlk 90 dəqiqənin qızıl qaydası" },
      { id: "inf-3", index: "03", title: "Evdə ilkin yardım addımları" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Miokard infarktının klassik təsviri — sol qola yayılan sıxıcı sinə ağrısı — pasiyentlərin təxminən üçdə birində müşahidə olunmur. Bu, xüsusilə qadınlarda və diabetli pasiyentlərdə diaqnozun gecikməsinə səbəb olur.",
      },
      {
        type: "heading",
        id: "inf-1",
        index: "1",
        text: "Atipik simptomlar niyə gözdən qaçır?",
      },
      {
        type: "paragraph",
        text: "Ürəkbulanma, kürək nahiyəsində küt ağrı, izaholunmaz yorğunluq və soyuq tərləmə çox vaxt mədə problemi və ya sadəcə yorğunluq kimi qiymətləndirilir. Diabetik neyropatiya isə ağrı hissini tam kütləşdirə bilər.",
      },
      {
        type: "quote",
        label: "Kliniki xəbərdarlıq",
        icon: "e911_emergency",
        text: "20 dəqiqədən artıq davam edən, istirahətlə keçməyən hər hansı sinə diskomfortu — hətta zəif olsa belə — 103 xidmətinə zəng üçün kifayət edən əsasdır.",
        attribution: "Dr. Nərmin Əliyeva",
      },
      {
        type: "heading",
        id: "inf-2",
        index: "2",
        text: "İlk 90 dəqiqənin qızıl qaydası",
      },
      {
        type: "checklist",
        intro: "Simptom başlayandan reperfuziyaya qədər olan addımlar:",
        items: [
          {
            title: "Dərhal 103-ə zəng edin",
            description:
              "Şəxsi avtomobillə xəstəxanaya getmək EKQ-nin yolda çəkilməsi imkanını itirir.",
          },
          {
            title: "Pasiyenti yarımoturaq vəziyyətə keçirin",
            description:
              "Bu, ağciyər dövranındakı yükü azaldır və tənəffüsü rahatlaşdırır.",
          },
          {
            title: "Sıxan geyimləri boşaldın",
            description: "Yaxa, kəmər və qalstuk açılmalıdır.",
          },
          {
            title: "Həkim göstərişi olmadan dərman verməyin",
            description:
              "Təzyiqin naməlum olduğu şəraitdə nitrat qəbulu təhlükəli hipotenziyaya səbəb ola bilər.",
          },
        ],
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "ESC Clinical Practice Guidelines (2023)",
        description:
          "Acute Coronary Syndromes: diagnosis and reperfusion timing recommendations.",
      },
      {
        id: "ref-2",
        source: "American Heart Association (Circulation, 2024)",
        description:
          "Sex differences in the clinical presentation of acute myocardial infarction.",
      },
    ],
  },

  {
    id: "art-003",
    slug: "arterial-tezyiqin-idare-edilmesi",
    title:
      "Arterial Təzyiqin İdarə Edilməsi: Duz Qəbulu və Natrium-Kalium Nisbətinin Əhəmiyyəti",
    excerpt:
      "Son kardiologiya araşdırmaları göstərir ki, təkcə natriumu məhdudlaşdırmaq kifayət deyil — hüceyrədaxili kalium konsentrasiyası da tarazlaşdırılmalıdır.",
    category: cat("tezyiq-ve-aritmiya"),
    coverImageUrl: "/images/article-tezyiq.svg",
    publishedAt: "2024-11-08",
    publishedAtLabel: "08 Noyabr 2024",
    referenceCount: 8,
    referenceLabel: "ESC 2023 Rəhbərliyi",
    viewCount: 3120,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 88,
    commentCount: 9,
    tableOfContents: [
      { id: "tz-1", index: "01", title: "Natrium tək günahkar deyil" },
      { id: "tz-2", index: "02", title: "Praktik rasion dəyişiklikləri" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Arterial hipertoniyanın qidalanma vasitəsilə korreksiyası yalnız duzun azaldılmasına yönəldikdə effekt gözləniləndən zəif olur. Müasir yanaşma natrium-kalium nisbətini hədəf götürür.",
      },
      {
        type: "heading",
        id: "tz-1",
        index: "1",
        text: "Natrium tək günahkar deyil",
      },
      {
        type: "paragraph",
        text: "Hüceyrədaxili kalium ehtiyatı azaldıqda natrium-kalium nasosunun işi pozulur və damar divarının hamar əzələ hüceyrələri artıq tonusda qalır. Nəticədə periferik müqavimət yüksəlir.",
      },
      {
        type: "checklist",
        intro: "Rasionda tarazlığı bərpa edən sadə addımlar:",
        items: [
          {
            title: "Gündəlik duzu 5 qramdan aşağı saxlayın",
            description: "Bu, təxminən bir çay qaşığına bərabərdir.",
          },
          {
            title: "Kalium mənbələrini artırın",
            description:
              "Şüyüd, ispanaq, banan, quru ərik və lobya gündəlik menyuya daxil edilməlidir.",
          },
          {
            title: "Hazır souslardan çəkinin",
            description:
              "Gizli natrium mənbələrinin böyük hissəsi məhz sənaye souslarındadır.",
          },
        ],
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "ESC/ESH Guidelines (2023)",
        description: "Management of arterial hypertension — dietary sodium targets.",
      },
    ],
  },

  {
    id: "art-004",
    slug: "sebebsiz-urek-doyuntuleri",
    title:
      "Səbəbsiz Ürək Döyüntüləri (Ekstrasistoliyalar): Nə Vaxt Təcili Həkimə Müraciət Edilməli?",
    excerpt:
      "Ekstrasistoliyaların psixoemosional və üzvi səbəbləri, 24 saatlıq Holter monitorinqinin diaqnostik dəqiqliyi və pasiyentlərin etdiyi tipik səhvlər.",
    category: cat("tezyiq-ve-aritmiya"),
    coverImageUrl: "/images/article-aritmiya.svg",
    publishedAt: "2024-10-28",
    publishedAtLabel: "28 Oktyabr 2024",
    referenceCount: 11,
    referenceLabel: "11 istinad",
    viewCount: 2740,
    author: mockAuthor,
    likeCount: 64,
    commentCount: 7,
    tableOfContents: [
      { id: "ar-1", index: "01", title: "Funksional yoxsa üzvi mənşəli?" },
      { id: "ar-2", index: "02", title: "Holter monitorinqi nə göstərir?" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Ekstrasistoliya — ürəyin növbədənkənar yığılması — sağlam insanlarda da qeydə alınır. Əsas sual bunun funksional, yoxsa struktur patologiya fonunda baş verməsidir.",
      },
      {
        type: "heading",
        id: "ar-1",
        index: "1",
        text: "Funksional yoxsa üzvi mənşəli?",
      },
      {
        type: "paragraph",
        text: "Kofein, yuxusuzluq, anemiya və qalxanabənzər vəzin hiperfunksiyası ən çox rast gəlinən funksional səbəblərdir. Üzvi səbəblər arasında isə keçirilmiş miokardit, klapan patologiyaları və işemik dəyişikliklər dayanır.",
      },
      {
        type: "quote",
        label: "Nə vaxt təcili müraciət?",
        icon: "warning",
        text: "Ürəkdöyünmə huşitirmə, göz qaralması və ya sinə ağrısı ilə müşayiət olunursa, bu, mütləq təxirəsalınmaz kardioloji qiymətləndirmə tələb edir.",
        attribution: "Dr. Nərmin Əliyeva",
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "ESC Guidelines on Ventricular Arrhythmias (2022)",
        description: "Risk stratification of premature ventricular complexes.",
      },
    ],
  },

  {
    id: "art-005",
    slug: "tezyiq-dermanlari-xronobiologiya",
    title:
      "Təzyiq dərmanları nə vaxt və necə qəbul edilməlidir? Xronobiologiya baxışından",
    excerpt:
      "Sirkad ritmlərin antihipertenziv preparatların biomənimsənilməsinə və gecə kardiak risklərinin neytrallaşdırılmasına kliniki sübut olunmuş təsirləri.",
    category: cat("kardiologiya"),
    coverImageUrl: "/images/article-derman.svg",
    publishedAt: "2024-11-12",
    publishedAtLabel: "12 Noyabr 2024",
    referenceCount: 8,
    referenceLabel: "8 istinad [ESC 2023]",
    viewCount: 5210,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 121,
    commentCount: 14,
    tableOfContents: [
      { id: "xr-1", index: "01", title: "Sirkad ritm və qan təzyiqi" },
      { id: "xr-2", index: "02", title: "Səhər yoxsa axşam qəbulu?" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Qan təzyiqi sutka ərzində sabit deyil: gecə 10–20% enmə (dipping) normal fizioloji hadisədir. Bu enmə baş vermirsə, kardiovaskulyar risk əhəmiyyətli dərəcədə artır.",
      },
      {
        type: "heading",
        id: "xr-1",
        index: "1",
        text: "Sirkad ritm və qan təzyiqi",
      },
      {
        type: "paragraph",
        text: "Renin-angiotenzin sisteminin aktivliyi gecə saatlarında pik həddə çatır. Bu səbəbdən bəzi pasiyentlərdə axşam qəbulu gecə profilinin normallaşmasına kömək edir.",
      },
      {
        type: "quote",
        label: "Vacib qeyd",
        icon: "info",
        text: "Dərman qəbulu saatının dəyişdirilməsi yalnız müalicə həkiminin nəzarəti altında və sutkalıq monitorinq nəticəsinə əsasən aparılmalıdır.",
        attribution: "Dr. Nərmin Əliyeva",
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "European Heart Journal (2023)",
        description: "Chronotherapy of antihypertensive drugs: current evidence.",
      },
    ],
  },

  {
    id: "art-006",
    slug: "xolesterin-mifi",
    title: "Xolesterin mifi: Hansı göstəricilər həqiqətən təhlükəlidir?",
    excerpt:
      "Ümumi xolesterin əvəzinə Apolipoprotein B və Lipoprotein(a) göstəricilərinin müasir ateroskleroz proqnozlaşdırılmasında strateji rolu.",
    category: cat("profilaktika"),
    coverImageUrl: "/images/article-xolesterin.svg",
    publishedAt: "2024-11-04",
    publishedAtLabel: "04 Noyabr 2024",
    referenceCount: 19,
    referenceLabel: "19 istinad [AHA]",
    viewCount: 6430,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 175,
    commentCount: 21,
    tableOfContents: [
      { id: "xo-1", index: "01", title: "Ümumi xolesterin niyə yetərli deyil?" },
      { id: "xo-2", index: "02", title: "ApoB və Lp(a) göstəriciləri" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Laboratoriya cavabında yalnız «ümumi xolesterin» rəqəminə baxmaq müasir kardiologiyada artıq kifayət sayılmır. Riskin əsl ölçüsü aterogen hissəciklərin sayıdır.",
      },
      {
        type: "heading",
        id: "xo-1",
        index: "1",
        text: "Ümumi xolesterin niyə yetərli deyil?",
      },
      {
        type: "paragraph",
        text: "Ümumi xolesterin həm qoruyucu HDL, həm də aterogen LDL fraksiyalarını özündə birləşdirir. Yüksək HDL fonunda «normal» görünən nəticə real riski gizlədə bilər.",
      },
      {
        type: "checklist",
        intro: "Profilaktik qiymətləndirmədə diqqət ediləsi göstəricilər:",
        items: [
          {
            title: "Apolipoprotein B (ApoB)",
            description:
              "Aterogen hissəciklərin faktiki sayını əks etdirir — LDL-dən daha dəqiq proqnostik markerdir.",
          },
          {
            title: "Lipoprotein(a)",
            description:
              "Genetik determinasiya olunub; ömürdə ən azı bir dəfə ölçülməlidir.",
          },
          {
            title: "Triqliserid/HDL nisbəti",
            description: "İnsulin rezistentliyinin dolayı göstəricisidir.",
          },
        ],
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "AHA Scientific Statement (2024)",
        description: "Apolipoprotein B as a primary target of lipid-lowering therapy.",
      },
    ],
  },

  {
    id: "art-007",
    slug: "araliqli-orucun-damar-elastikliyine-tesiri",
    title: "Aralıqlı orucun (Intermittent Fasting) damar elastikliyinə təsiri",
    excerpt:
      "Otofaqiya mexanizmlərinin endotel disfunksiyası və arterial sərtlik indekslərinə biokimyəvi təsirlərinin uzunmüddətli təhlili.",
    category: cat("diyet-ve-heyat-terzi"),
    coverImageUrl: "/images/article-oruc.svg",
    publishedAt: "2024-10-20",
    publishedAtLabel: "20 Oktyabr 2024",
    referenceCount: 23,
    referenceLabel: "23 istinad [Nature Med]",
    viewCount: 3980,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 96,
    commentCount: 11,
    tableOfContents: [
      { id: "or-1", index: "01", title: "Otofaqiya və damar divarı" },
      { id: "or-2", index: "02", title: "Kimlərə tövsiyə olunmur?" },
    ],
    blocks: [
      {
        type: "lead",
        text: "Aralıqlı oruc son onillikdə həm metabolik, həm də kardiovaskulyar tədqiqatların mərkəzinə keçdi. Lakin nəticələr universal deyil və pasiyent seçimi həlledicidir.",
      },
      {
        type: "heading",
        id: "or-1",
        index: "1",
        text: "Otofaqiya və damar divarı",
      },
      {
        type: "paragraph",
        text: "Uzunmüddətli aclıq intervalları hüceyrədaxili «təmizlənmə» proseslərini aktivləşdirir, oksidativ stress markerlərini azaldır və endotelin azot-oksid sintez qabiliyyətini yaxşılaşdırır.",
      },
      {
        type: "quote",
        label: "Kliniki məhdudiyyət",
        icon: "info",
        text: "Şəkərli diabetin dərman terapiyası fonunda, hamiləlikdə və yeyinti pozğunluğu anamnezi olan şəxslərdə bu rejim həkim nəzarəti olmadan tətbiq edilməməlidir.",
        attribution: "Dr. Nərmin Əliyeva",
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "Nature Medicine (2023)",
        description:
          "Time-restricted eating and vascular compliance: a randomized controlled trial.",
      },
    ],
  },

  {
    id: "art-008",
    slug: "sglt2-inhibitorlari-urek-catismazligi",
    title:
      "Ürək Çatışmazlığında SGLT2 İnhibitorları: Qlükometabolizmdən Kardiomiopatiyaya İnqilab",
    excerpt:
      "Əvvəlcə şəkərli diabet müalicəsi üçün hazırlanan bu preparatlar necə oldu ki, qorunmuş və azalmış atım fraksiyalı ürək çatışmazlığının təməl dirəyinə çevrildi? EMPEROR və DAPA-HF sınaqlarının təfsilatı.",
    category: cat("elmi-nesrler"),
    coverImageUrl: "/images/article-sglt2.svg",
    publishedAt: "2024-11-20",
    publishedAtLabel: "20 Noyabr 2024",
    referenceCount: 32,
    referenceLabel: "32 İstinad",
    viewCount: 7250,
    isFeatured: true,
    isPeerReviewed: true,
    author: mockAuthor,
    likeCount: 240,
    commentCount: 32,
    tableOfContents: [
      { id: "sg-1", index: "01", title: "Təsadüfi kəşfin arxasındakı mexanizm" },
      { id: "sg-2", index: "02", title: "EMPEROR və DAPA-HF nəticələri" },
    ],
    blocks: [
      {
        type: "lead",
        text: "SGLT2 inhibitorlarının kardioprotektiv effekti diabetdən asılı olmayaraq özünü göstərdi — bu, kardiologiyanın son onillikdəki ən əhəmiyyətli paradiqma dəyişikliklərindən biridir.",
      },
      {
        type: "heading",
        id: "sg-1",
        index: "1",
        text: "Təsadüfi kəşfin arxasındakı mexanizm",
      },
      {
        type: "paragraph",
        text: "Preparatların natriuretik təsiri, miokardın enerji substratının keton cisimciklərinə yönləndirilməsi və interstisial mayenin azaldılması ürək çatışmazlığında hospitalizasiya tezliyini əhəmiyyətli dərəcədə azaldır.",
      },
      {
        type: "paragraph",
        text: "EMPEROR-Reduced və DAPA-HF sınaqlarında ilkin son nöqtənin nisbi azalması 25%-ə çatdı və effekt HbA1c səviyyəsindən asılı olmadı.",
      },
    ],
    references: [
      {
        id: "ref-1",
        source: "New England Journal of Medicine (2020)",
        description: "DAPA-HF: Dapagliflozin in Patients with Heart Failure.",
      },
      {
        id: "ref-2",
        source: "New England Journal of Medicine (2021)",
        description: "EMPEROR-Preserved: Empagliflozin in Heart Failure with pEF.",
      },
    ],
  },
];

/* ---------------------------------------------------------------
 * Şərhlər (məqalə slug-ına görə)
 * ------------------------------------------------------------- */

export const mockComments: Record<string, Comment[]> = {
  "urek-saglamligi-ve-gundelik-stress": [
    {
      id: "cm-1",
      authorName: "Elmir Məmmədov",
      authorInitials: "EM",
      authorRole: "Pasiyent",
      createdAtLabel: "14 Noyabr 2024 • 14:20",
      body: "Doktor, çox təşəkkürlər ətraflı məqalə üçün. Xroniki stress zamanı səhər tezdən qəhvə qəbulu taxikardiyanı (ürək döyüntüsünü) kəskinləşdirə bilərmi? Gündəlik 1 fincan filtr qəhvəyə icazə verilirmi?",
      likeCount: 12,
      replies: [
        {
          id: "cm-1-r1",
          authorName: "Dr. Nərmin Əliyeva",
          authorInitials: "NƏ",
          authorRole: "Müəllif",
          authorAvatarUrl: "/images/doctor-avatar.svg",
          isAuthorVerified: true,
          isDoctorReply: true,
          createdAtLabel: "14 Noyabr 2024 • 15:45",
          body: "Salam, Elmir bəy. Çox vacib sualdır. Səhər saat 07:00–09:00 arası qanda endogen kortizol pik həddə olur. Bu zaman qəhvə qəbulu simpatik tonusu ikiqat artıra bilər. Tövsiyəmiz qəhvəni oyandıqdan ən azı 90 dəqiqə sonra və mütləq bol su ilə qəbul etməkdir.",
          likeCount: 27,
        },
      ],
    },
    {
      id: "cm-2",
      authorName: "Leyla Qasımova",
      authorInitials: "LQ",
      authorRole: "Oxucu",
      createdAtLabel: "14 Noyabr 2024 • 16:10",
      body: "5 qızıl qaydadakı 4-7-8 tənəffüs təcrübəsini təzyiq dalğalanması hiss edəndə tətbiq etdim, həqiqətən də nəbzi 5-7 dəqiqə ərzində stabilləşdirir. Hər kəsə oxumağı tövsiyə edirəm.",
      likeCount: 8,
    },
  ],
};
