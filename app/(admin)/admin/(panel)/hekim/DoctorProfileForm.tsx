"use client";

import { useState, useTransition } from "react";
import { ImagePicker, RepeaterField } from "@/components/admin";
import {
  getTranslatableLocales,
  isMultiLanguageEnabled,
  LOCALE_LABELS,
  routing,
} from "@/i18n/routing";
import { Button, FLAGS, Icon, TextAreaField, TextField } from "@/components/ui";
import type { Credential, DoctorProfile, DoctorStat, ResearchArea, TimelineEntry } from "@/lib/types";
import { updateDoctorProfile, type DoctorPayload } from "./actions";
import { cn } from "@/lib/utils";

const DOCTOR_IMAGE_SCOPE = { kind: "doctor" as const };

/** Dilə görə dəyişən sahələr — hər dilin öz nüsxəsi var */
interface Translatable {
  shortTitle: string;
  fullTitle: string;
  tagline: string;
  biography: string;
  quote: string;
  credentials: Credential[];
  stats: DoctorStat[];
  education: TimelineEntry[];
  researchAreas: ResearchArea[];
}

/**
 * Admin sorğusu xam Prisma qeydini qaytarır — `DoctorProfile` (publik tip)
 * `translations` sahəsini daşımır, ona görə formanın öz tipi var.
 */
export interface DoctorProfileFormProps {
  doctor: DoctorProfile & {
    translations?: Record<string, Partial<Translatable>> | null;
  };
}

type Lang = string;

const EMPTY_TRANSLATABLE: Translatable = {
  shortTitle: "",
  fullTitle: "",
  tagline: "",
  biography: "",
  quote: "",
  credentials: [],
  stats: [],
  education: [],
  researchAreas: [],
};

const STEPS = [
  { id: 0, label: "Kimlik", icon: "badge" },
  { id: 1, label: "Bioqrafiya", icon: "description" },
  { id: 2, label: "Göstəricilər", icon: "analytics" },
  { id: 3, label: "Təhsil", icon: "school" },
  { id: 4, label: "Tədqiqat", icon: "biotech" },
] as const;

// Hazır tədqiqat sahəsi ikonları
const RESEARCH_ICONS = [
  { icon: "monitor_heart", label: "Kardioloqiya" },
  { icon: "child_care", label: "Pediatriya" },
  { icon: "healing", label: "Müalicə" },
  { icon: "biotech", label: "Tədqiqat" },
  { icon: "science", label: "Elm" },
  { icon: "medical_services", label: "Tibb" },
  { icon: "psychology", label: "Psixologiya" },
  { icon: "vaccines", label: "Vaksinasiya" },
];

export function DoctorProfileForm({ doctor }: DoctorProfileFormProps) {
  const languageSupport = isMultiLanguageEnabled();
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [pending, startTransition] = useTransition();
  /** "Yadda saxla" boş adla basılıbsa — sahə birbaşa qırmızılaşsın deyə */
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);

  /* Ad, şəkillər — dilə görə dəyişmir, bütün saytda eynidir */
  const [fullName, setFullName] = useState(doctor.fullName);
  const [avatarUrl, setAvatarUrl] = useState(doctor.avatarUrl);
  const [portraitUrl, setPortraitUrl] = useState(doctor.portraitUrl);

  /*
   * Dilə görə dəyişən hər şey — bioqrafiya, titul, sitat, nişanlar,
   * statistika, təhsil, tədqiqat sahələri — hər dil üçün ayrı dəstdə
   * saxlanılır (`routing.locales`-ə görə dinamik — RU-ya bərkidilməyib).
   * Redaktor başqa dil tab-ına keçəndə eyni sahələr, amma o dilin məzmunu
   * göstərilir; "Yadda saxla" bütün dilləri birlikdə göndərir.
   */
  const [lang, setLang] = useState<Lang>(routing.defaultLocale);
  const [content, setContent] = useState<Record<Lang, Translatable>>(() => {
    const az: Translatable = {
      shortTitle: doctor.shortTitle,
      fullTitle: doctor.fullTitle,
      tagline: doctor.tagline,
      biography: doctor.biography,
      quote: doctor.quote,
      credentials: doctor.credentials,
      stats: doctor.stats,
      education: doctor.education,
      researchAreas: doctor.researchAreas,
    };
    const rest = Object.fromEntries(
      getTranslatableLocales().map((l) => [
        l,
        { ...EMPTY_TRANSLATABLE, ...doctor.translations?.[l] },
      ]),
    );
    return { [routing.defaultLocale]: az, ...rest };
  });

  const cur = content[lang];

  function update<K extends keyof Translatable>(key: K, value: Translatable[K]) {
    setContent((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: value } }));
  }

  function submit() {
    if (!fullName.trim()) {
      /* Ayrıca banner yerinə — Kimlik addımına aparılır, "Tam ad" sahəsi qırmızılaşır */
      setSubmitAttempted(true);
      setStep(0);
      return;
    }
    const az = content[routing.defaultLocale];
    const payload: DoctorPayload = {
      fullName,
      avatarUrl,
      portraitUrl,
      shortTitle: az.shortTitle,
      fullTitle: az.fullTitle,
      tagline: az.tagline,
      biography: az.biography,
      quote: az.quote,
      credentials: az.credentials,
      stats: az.stats,
      education: az.education,
      researchAreas: az.researchAreas,
      translations: Object.fromEntries(
        getTranslatableLocales().map((l) => [l, content[l]]),
      ),
    };
    startTransition(async () => {
      const result = await updateDoctorProfile(payload);
      setFeedback(
        result.success
          ? { tone: "ok", text: result.message ?? "Yadda saxlanıldı." }
          : { tone: "error", text: result.message ?? "Alınmadı." },
      );
    });
  }

  const canGoNext = step < STEPS.length - 1;
  const canGoPrev = step > 0;

  // Kredensial əlavə et
  function addCredential(text: string) {
    if (!text.trim()) return;
    update("credentials", [...cur.credentials, { icon: "verified", label: text.trim() }]);
  }

  // Stat əlavə et
  function addStat(value: string, label: string) {
    if (!value.trim() || !label.trim()) return;
    update("stats", [...cur.stats, { value: value.trim(), label: label.trim() }]);
  }

  // Tədqiqat sahəsi əlavə et
  function addResearchArea(iconName: string) {
    update("researchAreas", [
      ...cur.researchAreas,
      { id: crypto.randomUUID(), icon: iconName, title: "", description: "" },
    ]);
  }

  // Önizləmə komponenti
  function renderPreview() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary-container/30 border border-primary-container">
              <p className="text-xs text-outline mb-2">Header və Altlıq</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs text-on-primary">
                  {fullName.split(" ").map(n => n[0]).join("").slice(0, 2) || "DR"}
                </div>
                <div>
                  <p className="font-medium text-sm">{fullName || "Ad Soyad"}</p>
                  <p className="text-xs text-outline">{cur.shortTitle || "Titul"}</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-outline mb-2">Ana səhifə Hero</p>
              <h3 className="font-headline text-lg mb-1">{fullName || "Ad Soyad"}</h3>
              <p className="text-sm text-on-surface-variant mb-1">{cur.fullTitle || "Tam titul"}</p>
              <p className="text-xs text-outline">{cur.tagline || "Qısa xülasə"}</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-outline mb-2">Haqqında səhifəsi</p>
              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                {cur.biography || "Bioqrafiya mətni..."}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary-container/30 border border-primary-container">
              <p className="text-xs text-outline mb-2">Sitat bloku</p>
              <blockquote className="text-sm italic border-l-2 border-secondary pl-3">
                "{cur.quote || "Sitat..."}"
              </blockquote>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-outline mb-2">Nişanlar</p>
              <div className="flex flex-wrap gap-2">
                {cur.credentials.length > 0 ? cur.credentials.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-xs">
                    <Icon name="verified" size={12} className="text-secondary" />
                    {c.label}
                  </span>
                )) : <span className="text-xs text-outline">Nişan əlavə edin</span>}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary-container/30 border border-primary-container">
              <p className="text-xs text-outline mb-2">Statistika</p>
              <div className="grid grid-cols-2 gap-2">
                {cur.stats.length > 0 ? cur.stats.map((s, i) => (
                  <div key={i} className="text-center p-2 rounded bg-surface-container/50">
                    <p className="font-bold text-secondary">{s.value}</p>
                    <p className="text-xs text-outline">{s.label}</p>
                  </div>
                )) : <span className="text-xs text-outline col-span-2">Göstərici əlavə edin</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="text-xs text-outline mb-3">Haqqında səhifəsi - Təhsil</p>
            <div className="relative">
              {cur.education.length > 1 && (
                <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-secondary/30" />
              )}
              <div className="space-y-3">
                {cur.education.length > 0 ? cur.education.map((e, i) => (
                  <div key={i} className="flex gap-3 text-sm relative">
                    <div className="w-4 h-4 rounded-full bg-secondary shrink-0 mt-0.5 z-10" />
                    <div className="flex-1">
                      <p className="font-bold text-secondary text-xs">{e.period || "20XX – 20XX"}</p>
                      <p className="font-medium text-sm">{e.institution || "Qurum adı"}</p>
                      {e.description && <p className="text-xs text-outline">{e.description}</p>}
                    </div>
                  </div>
                )) : <p className="text-xs text-outline">Təhsil mərhələsi əlavə edin</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="text-xs text-outline mb-3">Tədqiqat sahələri</p>
            <div className="space-y-2">
              {cur.researchAreas.length > 0 ? cur.researchAreas.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded bg-surface-container/50">
                  <Icon name={r.icon || "science"} size={16} className="text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{r.title || "Sahə adı"}</p>
                    {r.description && <p className="text-xs text-outline">{r.description}</p>}
                  </div>
                </div>
              )) : <p className="text-xs text-outline">Sahə əlavə edin</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-space-sm">
      {/*
        * Dil tab-ı — bioqrafiya, titul, nişanlar və s. dilə görə dəyişir.
        * Ad və şəkillər yuxarıda paylaşılır (bütün dillərdə eynidir).
        * `getTranslatableLocales()`-ə görə dinamikdir — heç bir dil
        * bərkidilməyib. Dil dəstəyi söndürülübsə tab tamam gizlənir,
        * `lang` default dildə qalır, digər dillərin məzmunu (varsa)
        * toxunulmadan saxlanılıb göndərilir.
        */}
      {languageSupport && (
      <div className="flex items-center gap-space-xs rounded-xl border border-surface-container bg-surface-container-lowest p-space-2xs w-fit">
        {[routing.defaultLocale, ...getTranslatableLocales()].map((l) => {
          const Flag = FLAGS[l as keyof typeof FLAGS];
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "flex items-center gap-space-2xs px-space-md py-space-2xs rounded-lg font-label text-label-md font-semibold transition-colors",
                lang === l
                  ? "bg-secondary text-on-secondary"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              {Flag && <Flag className="w-5 h-[14px] shrink-0 rounded-[2px] object-cover" />}
              {LOCALE_LABELS[l as keyof typeof LOCALE_LABELS] ?? l}
            </button>
          );
        })}
      </div>
      )}

      <div className="flex flex-col lg:flex-row gap-space-md">
      {/* Sidebar Stepper */}
      <div className="lg:w-48 shrink-0">
        <div className="lg:sticky lg:top-20 rounded-xl border border-surface-container bg-surface-container-lowest p-space-sm">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {STEPS.map((s, idx) => {
              const isCurrent = step === idx;
              const isCompleted = step > idx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={cn(
                    "flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg transition-colors min-w-max lg:min-w-0",
                    isCurrent
                      ? "bg-secondary/12 text-secondary"
                      : isCompleted
                        ? "text-on-surface hover:bg-surface-container"
                        : "text-outline hover:bg-surface-container hover:text-on-surface-variant",
                  )}
                >
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    isCurrent ? "bg-secondary text-on-secondary" : isCompleted ? "bg-secondary/20 text-secondary" : "bg-surface-container text-outline",
                  )}>
                    {isCompleted ? <Icon name="check" size={14} /> : <Icon name={s.icon} size={14} />}
                  </span>
                  <span className="font-label text-label-sm truncate">{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-surface-container bg-surface-container-lowest overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-b border-surface-container">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline text-title-md">{STEPS[step].label}</h2>
              <span className="text-xs text-outline px-2 py-0.5 rounded-full bg-surface-container">{step + 1}/{STEPS.length}</span>
            </div>
            <div className="flex items-center gap-space-xs">
              {feedback && (
                <p className={cn("flex items-center gap-1 text-sm", feedback.tone === "ok" ? "text-secondary" : "text-error")}>
                  <Icon name={feedback.tone === "ok" ? "check_circle" : "error"} size={14} />
                  {feedback.text}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors",
                  showPreview ? "bg-secondary/12 text-secondary" : "text-outline hover:bg-surface-container",
                )}
              >
                <Icon name={showPreview ? "visibility" : "visibility_off"} size={16} />
                <span className="hidden sm:inline">Önizləmə</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={cn("grid gap-space-md p-space-md", showPreview ? "lg:grid-cols-2" : "")}>
            {/* Form */}
            <div className="space-y-space-md">
              {/* Step 0: Kimlik */}
              {step === 0 && (
                <div className="grid gap-space-md">
                  <div className="grid gap-space-md sm:grid-cols-2">
                    <ImagePicker
                      scope={DOCTOR_IMAGE_SCOPE}
                      label="Profil şəkli"
                      hint="Header, kartlar və müəllif rozeti"
                      value={avatarUrl}
                      options={[]}
                      onChange={setAvatarUrl}
                      compact
                    />
                    <ImagePicker
                      scope={DOCTOR_IMAGE_SCOPE}
                      label="Portret şəkli"
                      hint="Ana səhifənin hero bölməsi"
                      value={portraitUrl}
                      options={[]}
                      onChange={setPortraitUrl}
                      compact
                    />
                  </div>
                  <TextField
                    label="Tam ad"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    hint="Saytın hər yerində görünür, dildən asılı olmayaraq"
                    error={submitAttempted && !fullName.trim() ? "Ad boş ola bilməz" : undefined}
                  />
                  <TextField label="Qısa titul" placeholder="Pediatrik kardioloq" value={cur.shortTitle} onChange={(e) => update("shortTitle", e.target.value)} hint="Header və altlıqda" />
                  <TextField label="Tam titul" placeholder="Tibb üzrə fəlsəfə doktoru" value={cur.fullTitle} onChange={(e) => update("fullTitle", e.target.value)} hint="Hero və Haqqında səhifəsində" />
                  <TextField label="Qısa xülasə" placeholder="18+ İl Təcrübə • 48 Elmi Məqalə" value={cur.tagline} onChange={(e) => update("tagline", e.target.value)} hint="Hero-da görünür" />
                </div>
              )}

              {/* Step 1: Bioqrafiya */}
              {step === 1 && (
                <div className="grid gap-space-md">
                  <TextAreaField label="Bioqrafiya" rows={6} value={cur.biography} onChange={(e) => update("biography", e.target.value)} hint="Haqqında səhifəsində əsas mətn" />
                  <TextAreaField label="Sitat" rows={3} placeholder="Həkimlik sadəcə peşə deyil..." value={cur.quote} onChange={(e) => update("quote", e.target.value)} hint="Xüsusi blokda vurğulanır" />
                </div>
              )}

              {/* Step 2: Göstəricilər - Sadələşdirilmiş */}
              {step === 2 && (
                <div className="space-y-space-lg">
                  {/* Nişanlar */}
                  <div>
                    <label className="block font-label text-label-md text-on-surface mb-1">Nişanlar</label>
                    <p className="text-sm text-outline mb-3">Hero bölməsindəki peşəkar nişanlar</p>

                    {/* Mövcud nişanlar */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cur.credentials.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-secondary/10 text-sm group">
                          <Icon name="verified" size={14} className="text-secondary" />
                          {c.label}
                          <button
                            type="button"
                            onClick={() => update("credentials", cur.credentials.filter((_, idx) => idx !== i))}
                            className="w-5 h-5 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors"
                          >
                            <Icon name="close" size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Yeni nişan əlavə et */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Məs: Board Certified, PhD, FACC..."
                        className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addCredential((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon="add"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement);
                          addCredential(input.value);
                          input.value = "";
                        }}
                      >
                        Əlavə et
                      </Button>
                    </div>
                  </div>

                  <hr className="border-surface-container" />

                  {/* Statistika */}
                  <div>
                    <label className="block font-label text-label-md text-on-surface mb-1">Statistika</label>
                    <p className="text-sm text-outline mb-3">Rəqəmsal göstəricilər (təcrübə, məqalə sayı və s.)</p>

                    {/* Mövcud statistikalar */}
                    <div className="grid gap-2 mb-3">
                      {cur.stats.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50 group">
                          <div className="flex-1 flex items-center gap-3">
                            <span className="font-bold text-secondary text-lg min-w-[60px]">{s.value}</span>
                            <span className="text-on-surface-variant">{s.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => update("stats", cur.stats.filter((_, idx) => idx !== i))}
                            className="w-8 h-8 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Yeni stat əlavə et */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="18+"
                        className="w-20 h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-sm text-center font-bold focus:border-secondary focus:outline-none"
                        id="stat-value"
                      />
                      <input
                        type="text"
                        placeholder="İl Təcrübə"
                        className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                        id="stat-label"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const valueInput = document.getElementById("stat-value") as HTMLInputElement;
                            const labelInput = e.target as HTMLInputElement;
                            addStat(valueInput.value, labelInput.value);
                            valueInput.value = "";
                            labelInput.value = "";
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon="add"
                        onClick={() => {
                          const valueInput = document.getElementById("stat-value") as HTMLInputElement;
                          const labelInput = document.getElementById("stat-label") as HTMLInputElement;
                          addStat(valueInput.value, labelInput.value);
                          valueInput.value = "";
                          labelInput.value = "";
                        }}
                      >
                        Əlavə et
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Təhsil - Timeline */}
              {step === 3 && (
                <div>
                  <label className="block font-label text-label-md text-on-surface mb-1">Təhsil mərhələləri</label>
                  <p className="text-sm text-outline mb-4">Ən yenidən köhnəyə doğru sıralayın</p>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Vertical line */}
                    {cur.education.length > 0 && (
                      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-surface-container" />
                    )}

                    {/* Education items */}
                    <div className="space-y-4 mb-4">
                      {cur.education.map((e, i) => (
                        <div key={i} className="relative flex gap-4">
                          {/* Timeline dot */}
                          <div className="w-10 h-10 rounded-full bg-secondary/10 border-2 border-secondary flex items-center justify-center shrink-0 z-10">
                            <Icon name="school" size={18} className="text-secondary" />
                          </div>

                          {/* Content card */}
                          <div className="flex-1 p-4 rounded-lg border border-surface-container bg-surface-container/30">
                            {/* Period inputs */}
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="text"
                                value={e.period.split("–")[0]?.trim() || ""}
                                onChange={(ev) => {
                                  const updated = [...cur.education];
                                  const endYear = e.period.split("–")[1]?.trim() || "";
                                  updated[i] = { ...updated[i], period: `${ev.target.value} – ${endYear}` };
                                  update("education", updated);
                                }}
                                placeholder="2000"
                                className="w-20 h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm text-center font-medium focus:border-secondary focus:outline-none"
                              />
                              <span className="text-outline">–</span>
                              <input
                                type="text"
                                value={e.period.split("–")[1]?.trim() || ""}
                                onChange={(ev) => {
                                  const updated = [...cur.education];
                                  const startYear = e.period.split("–")[0]?.trim() || "";
                                  updated[i] = { ...updated[i], period: `${startYear} – ${ev.target.value}` };
                                  update("education", updated);
                                }}
                                placeholder="2006"
                                className="w-20 h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm text-center font-medium focus:border-secondary focus:outline-none"
                              />
                              <div className="flex-1" />
                              <button
                                type="button"
                                onClick={() => update("education", cur.education.filter((_, idx) => idx !== i))}
                                className="w-8 h-8 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors"
                              >
                                <Icon name="delete" size={16} />
                              </button>
                            </div>

                            {/* Institution */}
                            <input
                              type="text"
                              value={e.institution}
                              onChange={(ev) => {
                                const updated = [...cur.education];
                                updated[i] = { ...updated[i], institution: ev.target.value };
                                update("education", updated);
                              }}
                              placeholder="Universitet / Qurum adı"
                              className="w-full h-10 px-3 rounded-md border border-outline-variant bg-transparent text-sm font-medium focus:border-secondary focus:outline-none mb-2"
                            />

                            {/* Description */}
                            <input
                              type="text"
                              value={e.description}
                              onChange={(ev) => {
                                const updated = [...cur.education];
                                updated[i] = { ...updated[i], description: ev.target.value };
                                update("education", updated);
                              }}
                              placeholder="Dərəcə / İxtisas (məs: Tibb üzrə fəlsəfə doktoru)"
                              className="w-full h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm text-on-surface-variant focus:border-secondary focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new */}
                    <button
                      type="button"
                      onClick={() => update("education", [...cur.education, { id: crypto.randomUUID(), period: "", institution: "", description: "" }])}
                      className="flex items-center gap-3 w-full p-3 rounded-lg border-2 border-dashed border-outline-variant hover:border-secondary hover:bg-secondary/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-container group-hover:bg-secondary/10 flex items-center justify-center transition-colors">
                        <Icon name="add" size={20} className="text-outline group-hover:text-secondary" />
                      </div>
                      <span className="text-sm text-outline group-hover:text-secondary">Yeni təhsil mərhələsi əlavə et</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Tədqiqat - Sadələşdirilmiş */}
              {step === 4 && (
                <div>
                  <label className="block font-label text-label-md text-on-surface mb-1">Tədqiqat sahələri</label>
                  <p className="text-sm text-outline mb-4">Maraq və ixtisaslaşma sahələriniz</p>

                  {/* Mövcud sahələr */}
                  <div className="space-y-3 mb-4">
                    {cur.researchAreas.map((r, i) => (
                      <div key={i} className="p-4 rounded-lg border border-surface-container bg-surface-container/30">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                            <Icon name={r.icon || "science"} size={20} className="text-secondary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => {
                                const updated = [...cur.researchAreas];
                                updated[i] = { ...updated[i], title: e.target.value };
                                update("researchAreas", updated);
                              }}
                              placeholder="Sahə adı"
                              className="w-full h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm font-medium focus:border-secondary focus:outline-none"
                            />
                            <textarea
                              value={r.description}
                              onChange={(e) => {
                                const updated = [...cur.researchAreas];
                                updated[i] = { ...updated[i], description: e.target.value };
                                update("researchAreas", updated);
                              }}
                              placeholder="Qısa izah (istəyə bağlı)"
                              rows={2}
                              className="w-full px-3 py-2 rounded-md border border-outline-variant bg-transparent text-sm resize-none focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => update("researchAreas", cur.researchAreas.filter((_, idx) => idx !== i))}
                            className="w-8 h-8 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Yeni sahə əlavə et - ikon seçimi ilə */}
                  <div>
                    <p className="text-sm text-outline mb-2">Sahə əlavə edin:</p>
                    <div className="flex flex-wrap gap-2">
                      {RESEARCH_ICONS.map((item) => (
                        <button
                          key={item.icon}
                          type="button"
                          onClick={() => addResearchArea(item.icon)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant hover:border-secondary hover:bg-secondary/5 transition-colors"
                        >
                          <Icon name={item.icon} size={18} className="text-secondary" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Preview */}
            {showPreview && (
              <div className="lg:border-l lg:border-surface-container lg:pl-space-md">
                <div className="sticky top-4">
                  <p className="text-xs text-outline uppercase tracking-wider mb-space-sm flex items-center gap-1">
                    <Icon name="preview" size={14} />
                    Saytda belə görünəcək
                  </p>
                  {renderPreview()}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm border-t border-surface-container bg-surface-container/30">
            <Button variant="ghost" icon="arrow_back" onClick={() => setStep((s) => s - 1)} disabled={!canGoPrev} size="sm">
              Əvvəlki
            </Button>
            <div className="flex items-center gap-space-xs">
              <Button variant="secondary" icon="save" onClick={submit} disabled={pending} size="sm">
                {pending ? "..." : "Saxla"}
              </Button>
              {canGoNext && (
                <Button icon="arrow_forward" iconPosition="end" onClick={() => setStep((s) => s + 1)} size="sm">
                  Növbəti
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
