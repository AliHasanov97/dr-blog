"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
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

  store.doctor = {
    ...store.doctor,
    ...payload,
    education: payload.education.map((e) => ({ ...e, id: e.id || nextId("edu") })),
    researchAreas: payload.researchAreas.map((r) => ({
      ...r,
      id: r.id || nextId("ra"),
    })),
  };

  revalidatePath("/", "layout");
  revalidatePath("/haqqinda");
  revalidatePath("/admin/hekim");
  return { success: true, message: "Profil yeniləndi." };
}
