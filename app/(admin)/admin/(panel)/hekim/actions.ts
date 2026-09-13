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

export interface DoctorPayload {
  fullName: string;
  avatarUrl: string;
  portraitUrl: string;
  shortTitle: string;
  shortTitleRu: string;
  fullTitle: string;
  fullTitleRu: string;
  tagline: string;
  taglineRu: string;
  biography: string;
  biographyRu: string;
  quote: string;
  quoteRu: string;
  credentials: Credential[];
  credentialsRu: Credential[];
  stats: DoctorStat[];
  statsRu: DoctorStat[];
  education: TimelineEntry[];
  educationRu: TimelineEntry[];
  researchAreas: ResearchArea[];
  researchAreasRu: ResearchArea[];
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
  const educationRu = payload.educationRu.map((e) => ({
    ...e,
    id: e.id || nextId("edu"),
  }));
  const researchAreasRu = payload.researchAreasRu.map((r) => ({
    ...r,
    id: r.id || nextId("ra"),
  }));

  if (!USE_MOCK) {
    // Database mode
    const { dbUpdateDoctorProfile } = await import("@/lib/db/admin");
    await dbUpdateDoctorProfile({
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl,
      portraitUrl: payload.portraitUrl,
      shortTitle: payload.shortTitle,
      shortTitleRu: payload.shortTitleRu || null,
      fullTitle: payload.fullTitle,
      fullTitleRu: payload.fullTitleRu || null,
      tagline: payload.tagline,
      taglineRu: payload.taglineRu || null,
      biography: payload.biography,
      biographyRu: payload.biographyRu || null,
      quote: payload.quote,
      quoteRu: payload.quoteRu || null,
      credentials: payload.credentials,
      credentialsRu: payload.credentialsRu,
      stats: payload.stats,
      statsRu: payload.statsRu,
      education,
      educationRu,
      researchAreas,
      researchAreasRu,
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
