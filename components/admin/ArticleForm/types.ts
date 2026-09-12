/** Örtük şəklinin görünmə rejimi */
export type CoverMode = "none" | "card" | "full";

export const COVER_MODES = [
  {
    value: "full",
    label: "Kartda və məqalədə",
    icon: "wallpaper",
    description: "Siyahıda kart şəkli, məqalənin başında böyük örtük",
  },
  {
    value: "card",
    label: "Yalnız kartda",
    icon: "gallery_thumbnail",
    description: "Siyahıda görünür, məqalə birbaşa mətnlə başlayır",
  },
  {
    value: "none",
    label: "Şəkilsiz",
    icon: "hide_image",
    description: "Mövzu şəkillə izah olunmayanda — heç yerdə çıxmır",
  },
] as const;

/** Yeni məqalə üçün GUID — serverdəki `generateGuid` ilə eyni formatdadır */
export function newGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
