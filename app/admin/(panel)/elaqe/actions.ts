"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { nextId, store } from "@/lib/mock/store";
import type { ContactChannel, OfficeLocation, SocialLink } from "@/lib/types";

export interface ContactPayload {
  channels: ContactChannel[];
  office: OfficeLocation;
  socialLinks: SocialLink[];
}

export async function updateContactInfo(
  payload: ContactPayload,
): Promise<ActionResult> {
  store.channels = payload.channels;
  store.office = payload.office;
  store.doctor.socialLinks = payload.socialLinks.map((s) => ({
    ...s,
    id: s.id || nextId("sl"),
  }));
  revalidatePath("/elaqe");
  revalidatePath("/haqqinda");
  revalidatePath("/", "layout");
  revalidatePath("/admin/elaqe");
  return { success: true, message: "Əlaqə məlumatları yeniləndi." };
}
