"use client";

import { useState, useTransition } from "react";
import { Button, Icon, TextAreaField, TextField } from "@/components/ui";
import type { ContactChannel, OfficeLocation, SocialLink } from "@/lib/types";
import { updateContactInfo } from "./actions";
import { cn } from "@/lib/utils";

// Hazır sosial platform seçimləri
const SOCIAL_PLATFORMS = [
  { platform: "Instagram", icon: "photo_camera", placeholder: "@dr.narmin" },
  { platform: "LinkedIn", icon: "work", placeholder: "linkedin.com/in/..." },
  { platform: "YouTube", icon: "play_circle", placeholder: "youtube.com/@..." },
  { platform: "Facebook", icon: "group", placeholder: "facebook.com/..." },
  { platform: "X (Twitter)", icon: "alternate_email", placeholder: "@dr_narmin" },
  { platform: "Telegram", icon: "send", placeholder: "@dr_narmin" },
  { platform: "WhatsApp", icon: "chat", placeholder: "+994..." },
  { platform: "Web", icon: "language", placeholder: "example.com" },
];

const TABS = [
  { id: "channels", label: "Kanallar", icon: "call" },
  { id: "social", label: "Sosial", icon: "share" },
  { id: "clinic", label: "Klinika", icon: "local_hospital" },
  { id: "schedule", label: "Qrafik", icon: "schedule" },
] as const;

type TabId = typeof TABS[number]["id"];

export interface ContactSettingsFormProps {
  channels: ContactChannel[];
  office: OfficeLocation;
  socialLinks: SocialLink[];
}

export function ContactSettingsForm({
  channels: initialChannels,
  office: initialOffice,
  socialLinks: initialSocialLinks,
}: ContactSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("channels");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [channels, setChannels] = useState(initialChannels);
  const [office, setOffice] = useState(initialOffice);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);

  function setChannelField<K extends keyof ContactChannel>(
    index: number,
    key: K,
    value: ContactChannel[K],
  ) {
    setChannels((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    );
    setFeedback(null);
  }

  function setOfficeField<K extends keyof OfficeLocation>(key: K, value: OfficeLocation[K]) {
    setOffice((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  }

  function addSocialLink(platformName: string) {
    const platform = SOCIAL_PLATFORMS.find(p => p.platform === platformName);
    if (!platform) return;
    setSocialLinks([...socialLinks, {
      id: crypto.randomUUID(),
      platform: platform.platform,
      icon: platform.icon,
      handle: "",
      url: "",
      description: "",
    }]);
    setFeedback(null);
  }

  function submit() {
    startTransition(async () => {
      const result = await updateContactInfo({ channels, office, socialLinks });
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
        <div className="flex items-center justify-between px-space-md py-space-sm">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
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
          <div className="flex items-center gap-space-sm">
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
        {/* Kanallar tab */}
        {activeTab === "channels" && (
          <div>
            <p className="text-sm text-outline mb-4">
              Əlaqə səhifəsindəki nömrə və e-poçtlar
            </p>

            <div className="space-y-3">
              {channels.map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50"
                >
                  <span className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Icon name={c.icon} size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-outline mb-1">{c.title}</p>
                    <input
                      type="text"
                      value={c.values.join(", ")}
                      onChange={(e) =>
                        setChannelField(
                          i,
                          "values",
                          e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                        )
                      }
                      placeholder="Nömrə və ya e-poçt"
                      className="w-full h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sosial tab */}
        {activeTab === "social" && (
          <div>
            <p className="text-sm text-outline mb-4">
              Saytın hər yerində görünən sosial media linkləri
            </p>

            <div className="space-y-3 mb-6">
              {socialLinks.map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container/50">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon name={s.icon || "link"} size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-outline mb-1">{s.platform}</p>
                      <input
                        type="text"
                        value={s.handle || ""}
                        onChange={(e) => {
                          const updated = [...socialLinks];
                          updated[i] = { ...updated[i], handle: e.target.value };
                          setSocialLinks(updated);
                          setFeedback(null);
                        }}
                        placeholder={SOCIAL_PLATFORMS.find(p => p.platform === s.platform)?.placeholder}
                        className="w-full h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-outline mb-1">Link</p>
                      <input
                        type="url"
                        value={s.url}
                        onChange={(e) => {
                          const updated = [...socialLinks];
                          updated[i] = { ...updated[i], url: e.target.value };
                          setSocialLinks(updated);
                          setFeedback(null);
                        }}
                        placeholder="https://..."
                        className="w-full h-9 px-3 rounded-md border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSocialLinks(socialLinks.filter((_, idx) => idx !== i));
                      setFeedback(null);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm text-outline mb-2">Əlavə edin:</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.filter(p => !socialLinks.some(s => s.platform === p.platform)).map((platform) => (
                  <button
                    key={platform.platform}
                    type="button"
                    onClick={() => addSocialLink(platform.platform)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant hover:border-secondary hover:bg-secondary/5 transition-colors"
                  >
                    <Icon name={platform.icon} size={18} className="text-secondary" />
                    <span className="text-sm">{platform.platform}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Klinika tab */}
        {activeTab === "clinic" && (
          <div>
            <p className="text-sm text-outline mb-4">
              Əlaqə səhifəsində göstərilən klinika məlumatları
            </p>

            <div className="grid gap-space-md sm:grid-cols-2">
              <TextField
                label="Klinikanın adı"
                value={office.name}
                onChange={(e) => setOfficeField("name", e.target.value)}
              />
              <TextField
                label="Şöbə"
                value={office.department}
                onChange={(e) => setOfficeField("department", e.target.value)}
              />
              <TextField
                label="Şəhər"
                value={office.city}
                onChange={(e) => setOfficeField("city", e.target.value)}
              />
              <TextField
                label="Otaq / Mərtəbə"
                value={office.room}
                onChange={(e) => setOfficeField("room", e.target.value)}
              />
              <TextAreaField
                label="Tam ünvan"
                rows={2}
                value={office.addressLine}
                onChange={(e) => setOfficeField("addressLine", e.target.value)}
                className="sm:col-span-2"
              />
              <TextField
                label="Qısa ünvan"
                placeholder="Xəritədə göstərilən"
                value={office.shortAddress}
                onChange={(e) => setOfficeField("shortAddress", e.target.value)}
              />
              <TextField
                label="Xəritə linki"
                placeholder="Google Maps linki"
                value={office.mapUrl}
                onChange={(e) => setOfficeField("mapUrl", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Qrafik tab */}
        {activeTab === "schedule" && (
          <div>
            <p className="text-sm text-outline mb-4">
              İş günləri və saatları
            </p>

            <div className="space-y-3 mb-4">
              {office.schedule.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={item.day}
                    onChange={(e) => {
                      const updated = [...office.schedule];
                      updated[i] = { ...updated[i], day: e.target.value };
                      setOfficeField("schedule", updated);
                    }}
                    placeholder="Bazar ertəsi – Cümə"
                    className="flex-1 h-10 px-3 rounded-md border border-outline-variant bg-transparent text-sm focus:border-secondary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.hours}
                    onChange={(e) => {
                      const updated = [...office.schedule];
                      updated[i] = { ...updated[i], hours: e.target.value };
                      setOfficeField("schedule", updated);
                    }}
                    placeholder="09:00 – 17:30"
                    className="w-40 h-10 px-3 rounded-md border border-outline-variant bg-transparent text-sm text-center focus:border-secondary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = office.schedule.filter((_, idx) => idx !== i);
                      setOfficeField("schedule", updated);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-error/20 flex items-center justify-center text-outline hover:text-error transition-colors"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setOfficeField("schedule", [...office.schedule, { day: "", hours: "" }]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-outline-variant hover:border-secondary hover:bg-secondary/5 transition-colors text-sm text-outline hover:text-secondary"
            >
              <Icon name="add" size={18} />
              Yeni sətir əlavə et
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
