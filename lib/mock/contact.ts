import type { ContactChannel, FaqItem, OfficeLocation } from "@/lib/types";

export const mockContactChannels: ContactChannel[] = [
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
  },
];

export const mockOffice: OfficeLocation = {
  name: "Mərkəzi Klinika",
  department: "Kardiologiya və Aritmologiya Şöbəsi",
  addressLine:
    "Bakı şəhəri, Səbail rayonu, Parlament prospekti 76 (Elmlər Akademiyası metrosunun yaxınlığı)",
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
};

export const mockFaq: FaqItem[] = [
  {
    id: "faq-1",
    question: "Həkimə sualları birbaşa necə ünvanlaya bilərəm?",
    answer:
      "Akademik suallar, məqalə rəyləri və ümumi sorğular üçün müraciət formasını doldura və ya rəsmi e-poçt ünvanına yaza bilərsiniz. Həkim təqvim sıxlığına uyğun olaraq məktubları şəxsən nəzərdən keçirir.",
  },
  {
    id: "faq-2",
    question: "Məqalələr üzrə şəxsi analizlərimi göndərə bilərəmmi?",
    answer:
      "Bəli, nəşr edilmiş klinik təhlillərlə bağlı oxucu müzakirəsi məqsədilə epikriz və ya EKQ fraqmentlərini forma vasitəsilə anonimləşdirərək göndərə bilərsiniz. Lakin unutmayın ki, onlayn rəylər rəsmi ambulator diaqnozu əvəz etmir.",
  },
  {
    id: "faq-3",
    question: "Konfrans və elmi tədbirlərdə spikerlik üçün müraciət qaydası necədir?",
    answer:
      "Beynəlxalq və yerli konfrans təşkilatçıları tədbir proqramı, mövzu çərçivəsi və tarixi göstərilməklə birbaşa elmi.elaqe@drnarmin.az ünvanına rəsmi dəvət məktubu göndərə bilərlər.",
  },
];

export const inquiryTypeOptions = [
  { value: "scientific", label: "Elmi sual / Məqalə haqqında" },
  { value: "collaboration", label: "Əməkdaşlıq və Müsahibə təklifi" },
  { value: "press", label: "Mətbuat & Müsahibə" },
  { value: "general", label: "Ümumi Məlumat" },
] as const;
