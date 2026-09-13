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
  shortTitle: string;
  fullTitle: string;
  avatarUrl: string;
  portraitUrl: string;
  tagline: string;
  biography: string;
  quote: string;
  credentials: Credential[];
  stats: DoctorStat[];
  education: TimelineEntry[];
  researchAreas: ResearchArea[];
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

  if (!USE_MOCK) {
    // Database mode
    const { dbUpdateDoctorProfile } = await import("@/lib/db/admin");
    await dbUpdateDoctorProfile({
      fullName: payload.fullName,
      shortTitle: payload.shortTitle,
      fullTitle: payload.fullTitle,
      avatarUrl: payload.avatarUrl,
      portraitUrl: payload.portraitUrl,
      tagline: payload.tagline,
      biography: payload.biography,
      quote: payload.quote,
      credentials: payload.credentials,
      stats: payload.stats,
      education,
      researchAreas,
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
