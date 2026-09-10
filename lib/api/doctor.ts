import { store } from "@/lib/mock/store";
import type { DoctorProfile } from "@/lib/types";
import { USE_MOCK } from "./config";
import { mockResponse } from "./http";
import { dbGetDoctorProfile } from "@/lib/db/doctor";
import { safeDb } from "./safe";

/** Həkimin profil məlumatları */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  if (!USE_MOCK) {
    /* Baza əlçatan deyilsə sayt açılmağa davam etsin — profil
     * standart məzmunla göstərilir, ISR onu özü yeniləyir. */
    const profile = await safeDb("həkim profili", dbGetDoctorProfile, null);
    return profile ?? store.doctor;
  }
  return mockResponse(store.doctor);
}
