"use server";

import { revalidatePath } from "next/cache";
import { revalidateSitePath } from "@/lib/revalidate-site";
import type { ActionResult } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/api/config";
import { nextId, store } from "@/lib/mock/store";
import type {
  Credential,
  DoctorStat,
  ResearchArea,
  TimelineEntry,
} from "@/lib/types";

/** Dilə görə dəyişən sahələr — `DoctorProfile.translations`-da bu şəkildə saxlanılır */
export interface TranslatableDoctorFields {
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

export interface DoctorPayload {
  fullName: string;
  avatarUrl: string;
  portraitUrl: string;
  shortTitle: string;
  fullTitle: string;
  tagline: string;
  biography: string;
  quote: string;
  credentials: Credential[];
  stats: DoctorStat[];
  education: TimelineEntry[];
  researchAreas: ResearchArea[];
  /** Digər dillərdəki variantlar — açar dil kodu (məs. "ru") */
  translations: Record<string, Partial<TranslatableDoctorFields>>;
}

export async function updateDoctorProfile(
  payload: DoctorPayload,
): Promise<ActionResult> {
  if (!payload.fullName.trim()) {
    return { success: false, message: "Ad boş ola bilməz." };
  }

  const education = payload.education.map((e) => ({
    ...e,
    id: e.id || nextId("edu"),
  }));
  const researchAreas = payload.researchAreas.map((r) => ({
    ...r,
    id: r.id || nextId("ra"),
  }));

  /* Hər dil üçün eyni ID-təyinetmə qaydası — gələcəkdə RU-dan başqa dil
   * əlavə olunsa da (bax: i18n/routing.ts) buraya toxunmaq lazım deyil */
  const translations: Record<string, Partial<TranslatableDoctorFields>> = {};
  for (const [locale, fields] of Object.entries(payload.translations)) {
    translations[locale] = {
      ...fields,
      ...(fields.education && {
        education: fields.education.map((e) => ({ ...e, id: e.id || nextId("edu") })),
      }),
      ...(fields.researchAreas && {
        researchAreas: fields.researchAreas.map((r) => ({ ...r, id: r.id || nextId("ra") })),
      }),
    };
  }

  if (!USE_MOCK) {
    // Database mode
    const { dbUpdateDoctorProfile } = await import("@/lib/db/admin");
    await dbUpdateDoctorProfile({
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl,
      portraitUrl: payload.portraitUrl,
      shortTitle: payload.shortTitle,
      fullTitle: payload.fullTitle,
      tagline: payload.tagline,
      biography: payload.biography,
      quote: payload.quote,
      credentials: payload.credentials,
      stats: payload.stats,
      education,
      researchAreas,
      translations,
    });

    revalidatePath("/", "layout");
    revalidateSitePath("/about");
    revalidatePath("/admin/hekim");
    return { success: true, message: "Profil yeniləndi." };
  }

  // Mock mode
  store.doctor = {
    ...store.doctor,
    ...payload,
    education,
    researchAreas,
  };

  revalidatePath("/", "layout");
  revalidateSitePath("/about");
  revalidatePath("/admin/hekim");
  return { success: true, message: "Profil yeniləndi." };
}
