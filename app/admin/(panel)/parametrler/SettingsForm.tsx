"use client";

import { useState, useTransition, useRef } from "react";
import { Button, Icon, TextAreaField, TextField } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";
import { updateSettings } from "./actions";
import { uploadMedia } from "../_resources/media-actions";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "Ümumi", icon: "tune" },
  { id: "appearance", label: "Görünüş", icon: "palette" },
  { id: "articles", label: "Məqalələr", icon: "article" },
] as const;

type TabId = typeof TABS[number]["id"];

export interface SettingsFormProps {
  settings: SiteSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [values, setValues] = useState(settings);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  }

  function submit() {
    startTransition(async () => {
      const result = await updateSettings(values);
      setFeedback(
        result.success
          ? { tone: "ok", text: "Yadda saxlanıldı" }
          : { tone: "error", text: "Xəta baş verdi" }
      );
    });
  }

  return (
    <div className="rounded-xl border border-surface-container bg-surface-container-lowest overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-surface-container">
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between px-space-md py-space-sm">
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-secondary text-on-secondary"
                    : "text-outline hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            {feedback && (
              <span className={cn(
                "flex items-center gap-1 text-sm",
                feedback.tone === "ok" ? "text-secondary" : "text-error"
              )}>
                <Icon name={feedback.tone === "ok" ? "check_circle" : "error"} size={16} />
                {feedback.text}
              </span>
            )}
            <Button icon="save" onClick={submit} disabled={pending} size="sm">
              {pending ? "..." : "Saxla"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-space-lg">
        {/* Ümumi tab */}
        {activeTab === "general" && (
          <div className="space-y-space-lg">
            <div>
              <h3 className="font-label text-label-lg text-on-surface mb-1">Sayt məlumatları</h3>
              <p className="text-sm text-outline mb-4">Saytın başlığı və SEO üçün təsviri</p>

              <div className="grid gap-space-md sm:grid-cols-2">
                <TextField
                  label="Sayt adı"
                  required
                  value={values.siteName}
                  onChange={(e) => set("siteName", e.target.value)}
                />
                <TextField
                  label="Alt başlıq"
                  placeholder="T.e.n., Kardioloq"
                  value={values.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                />
                <TextAreaField
                  label="Meta təsvir"
                  rows={3}
                  placeholder="Axtarış nəticələrində görünən mətn"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            </div>

            <hr className="border-surface-container" />

            <div>
              <h3 className="font-label text-label-lg text-on-surface mb-1">Ana səhifə</h3>
              <p className="text-sm text-outline mb-4">Hero bölməsindəki başlıq və mətnlər</p>

              <div className="grid gap-space-md sm:grid-cols-2">
                <TextField
                  label="Üst yazı"
                  placeholder="Kardiologiya · Elmi Bloq"
                  value={values.heroEyebrow}
                  onChange={(e) => set("heroEyebrow", e.target.value)}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Əsas başlıq"
                  placeholder="Ürək sağlamlığı haqqında sübuta əsaslanan yazılar"
                  value={values.heroHeadline}
                  onChange={(e) => set("heroHeadline", e.target.value)}
                  className="sm:col-span-2"
                />
                <TextAreaField
                  label="Alt mətn"
                  hint="Həkimin adı və titulundan sonra gəlir"
                  rows={2}
                  placeholder="Beynəlxalq protokolların sadə dildə izahı, klinik icmallar və pasiyentlər üçün praktik bələdçilər."
                  value={values.heroDescription}
                  onChange={(e) => set("heroDescription", e.target.value)}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Görünüş tab */}
        {activeTab === "appearance" && (
          <AppearanceTab values={values} set={set} />
        )}

        {/* Məqalələr tab */}
        {activeTab === "articles" && (
          <div className="space-y-space-lg">
            <div>
              <h3 className="font-label text-label-lg text-on-surface mb-1">Siyahı tənzimləmələri</h3>
              <p className="text-sm text-outline mb-4">Məqalə siyahısının görünüşü</p>

              <div className="max-w-xs">
                <TextField
                  label="Səhifə başına məqalə"
                  type="number"
                  value={String(values.articlesPerPage)}
                  onChange={(e) => set("articlesPerPage", Number(e.target.value) || 10)}
                />
              </div>
            </div>


            <div>
              <h3 className="font-label text-label-lg text-on-surface mb-1">Bülleten</h3>
              <p className="text-sm text-outline mb-4">E-poçt abunəliyi forması</p>

              <ToggleCard
                active={values.newsletterEnabled}
                onChange={(v) => set("newsletterEnabled", v)}
                icon="mail"
                title="Bülleten aktivdir"
                description="Saytda abunə formaları göstərilir"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Toggle card component
function ToggleCard({
  active,
  onChange,
  icon,
  title,
  description,
  disabled = false,
}: {
  active: boolean;
  onChange: (value: boolean) => void;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!active)}
      disabled={disabled}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-lg border text-left transition-all",
        disabled && "opacity-50 cursor-not-allowed",
        active
          ? "border-secondary/40 bg-secondary/5"
          : "border-surface-container hover:border-outline-variant",
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        active ? "bg-secondary/10" : "bg-surface-container"
      )}>
        <Icon name={icon} size={20} className={active ? "text-secondary" : "text-outline"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-on-surface">{title}</p>
        <p className="text-sm text-outline">{description}</p>
      </div>
      <Icon
        name={active ? "toggle_on" : "toggle_off"}
        size={28}
        className={active ? "text-secondary" : "text-outline"}
      />
    </button>
  );
}

// Loading preview component
function LoadingPreview({ text, logoUrl, showText = true, showLogo = false }: { text: string; logoUrl?: string; showText?: boolean; showLogo?: boolean }) {
  const charCount = text.length;
  const typingDuration = charCount * 0.08;
  const holdDuration = 0.5;
  const fadeDuration = 0.3;
  const totalCycle = typingDuration + holdDuration + fadeDuration + 0.1;

  const typeEndPercent = ((typingDuration + 0.1) / totalCycle) * 100;
  const holdEndPercent = ((typingDuration + 0.1 + holdDuration) / totalCycle) * 100;
  const fadeEndPercent = ((typingDuration + 0.1 + holdDuration + fadeDuration) / totalCycle) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes previewTypeLoop {
            0% { opacity: 0; transform: translateY(10px); }
            ${typeEndPercent.toFixed(1)}% { opacity: 1; transform: translateY(0); }
            ${holdEndPercent.toFixed(1)}% { opacity: 1; transform: translateY(0); }
            ${fadeEndPercent.toFixed(1)}% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 0; transform: translateY(10px); }
          }
          @keyframes previewLogoPulse {
            0%, 100% { opacity: 0.4; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1); }
          }
        `
      }} />
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-surface border border-surface-container min-h-[200px] relative overflow-hidden gap-4">
        <p className="text-xs text-outline mb-2">Önizləmə</p>

        {!showText && !showLogo && (
          <p className="text-sm text-outline">Heç bir element seçilməyib</p>
        )}

        {showLogo && logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 sm:h-12 w-auto object-contain"
            style={{ animation: "previewLogoPulse 1.2s ease-in-out infinite" }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        {showText && (
          <div className="flex items-center justify-center" key={text}>
            {text.split("").map((char, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block font-headline font-bold text-primary",
                  showLogo && logoUrl ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                )}
                style={{
                  opacity: 0,
                  animation: `previewTypeLoop ${totalCycle}s ease-in-out infinite`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-secondary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Görünüş tab komponenti
function AppearanceTab({
  values,
  set,
}: {
  values: SiteSettings;
  set: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.set("file", files[0]);
      const result = await uploadMedia(data, "image", { kind: "site" });
      if (result.success && result.item) {
        set("loadingLogo", result.item.url);
        set("loadingShowLogo", true);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-space-lg">
      <div>
        <h3 className="font-label text-label-lg text-on-surface mb-1">Loading ekranı</h3>
        <p className="text-sm text-outline mb-4">Səhifə yüklənərkən göstərilən animasiya. İstədiyinizi seçin - hər ikisini eyni anda da göstərə bilərsiniz.</p>

        <div className="grid gap-space-lg lg:grid-cols-2">
          {/* Sol tərəf - seçimlər */}
          <div className="space-y-4">
            {/* Mətn */}
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all",
              values.loadingShowText ? "border-secondary bg-secondary/5" : "border-surface-container"
            )}>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={values.loadingShowText}
                  onChange={(e) => set("loadingShowText", e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-outline-variant accent-secondary"
                />
                <span className="font-medium text-on-surface">Mətn göstər</span>
              </label>
              <TextField
                label=""
                placeholder="VAHID.AZ"
                value={values.loadingText}
                onChange={(e) => set("loadingText", e.target.value.toUpperCase())}
              />
              <p className="text-xs text-outline mt-2">
                Hərflər soldan sağa animasiya ilə görünür
              </p>
            </div>

            {/* Logo */}
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all",
              values.loadingShowLogo ? "border-secondary bg-secondary/5" : "border-surface-container"
            )}>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={values.loadingShowLogo}
                  onChange={(e) => set("loadingShowLogo", e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-outline-variant accent-secondary"
                />
                <span className="font-medium text-on-surface">Logo göstər</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                hidden
                onChange={(e) => handleLogoUpload(e.target.files)}
              />

              {values.loadingLogo ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50">
                  <img src={values.loadingLogo} alt="Logo" className="h-10 w-auto object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-outline truncate">{values.loadingLogo.split('/').pop()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-secondary hover:underline"
                  >
                    {uploading ? "..." : "Dəyiş"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border border-dashed border-outline-variant hover:border-secondary transition-colors"
                >
                  <Icon name={uploading ? "hourglass_top" : "upload"} size={20} className="text-outline" />
                  <span className="text-sm text-outline">
                    {uploading ? "Yüklənir..." : "Logo yüklə"}
                  </span>
                </button>
              )}
              <p className="text-xs text-outline mt-2">
                PNG, SVG, WEBP — şəffaf fon tövsiyə olunur
              </p>
            </div>
          </div>

          {/* Önizləmə */}
          <LoadingPreview
            text={values.loadingText || "LOADING"}
            logoUrl={values.loadingLogo || undefined}
            showText={values.loadingShowText}
            showLogo={values.loadingShowLogo}
          />
        </div>
      </div>
    </div>
  );
}
