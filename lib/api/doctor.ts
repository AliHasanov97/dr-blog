import { store } from "@/lib/mock/store";
import type { DoctorProfile } from "@/lib/types";
import { USE_MOCK } from "./config";
import { mockResponse } from "./http";
import { dbGetDoctorProfile } from "@/lib/db/doctor";

/** Həkimin profil məlumatları */
export async function getDoctorProfile(): Promise<DoctorProfile> {
  if (!USE_MOCK) {
    const profile = await dbGetDoctorProfile();
    if (!profile) {
      throw new Error("Doctor profile not found");
    }
    return profile;
  }
  return mockResponse(store.doctor);
}
