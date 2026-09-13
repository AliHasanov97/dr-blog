"use server";

import { revalidatePath } from "next/cache";
import { revalidateSitePath } from "@/lib/revalidate-site";
import type { ActionResult } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/api/config";
import { nextId, store } from "@/lib/mock/store";
import type { ContactChannel, OfficeLocation, SocialLink } from "@/lib/types";

export interface ContactPayload {
  channels: ContactChannel[];
  office: OfficeLocation;
  socialLinks: SocialLink[];
}

function refresh() {
  revalidateSitePath("/contact");
  revalidateSitePath("/about");
  revalidatePath("/", "layout");
  revalidatePath("/admin/elaqe");
}

/** Nömrə/e-poçt dəyişəndə düymənin linki də özü uyğunlaşsın deyə */
function buildChannelHref(kind: string, value: string): string {
  if (kind === "whatsapp") return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
  if (kind === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (kind === "email") return `mailto:${value.trim()}`;
  return value;
}

export async function updateContactInfo(
  payload: ContactPayload,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    // Database mode
    const {
      dbUpdateContactChannel,
      dbUpdateOfficeLocation,
      dbUpdateDoctorProfile,
    } = await import("@/lib/db/admin");

    await Promise.all([
      ...payload.channels.map((c) =>
        dbUpdateContactChannel(c.id, {
          values: c.values,
          href: buildChannelHref(c.kind, c.values[0] ?? ""),
        }),
      ),
      dbUpdateOfficeLocation({
        name: payload.office.name,
        department: payload.office.department,
        addressLine: payload.office.addressLine,
        room: payload.office.room,
        city: payload.office.city,
        shortAddress: payload.office.shortAddress,
        mapUrl: payload.office.mapUrl,
        mapImageUrl: payload.office.mapImageUrl,
        schedule: payload.office.schedule,
      }),
      dbUpdateDoctorProfile({ socialLinks: payload.socialLinks }),
    ]);

    refresh();
    return { success: true, message: "Əlaqə məlumatları yeniləndi." };
  }

  // Mock mode
  store.channels = payload.channels.map((c) => ({
    ...c,
    href: buildChannelHref(c.kind, c.values[0] ?? ""),
  }));
  store.office = payload.office;
  store.doctor.socialLinks = payload.socialLinks.map((s) => ({
    ...s,
    id: s.id || nextId("sl"),
  }));
  refresh();
  return { success: true, message: "Əlaqə məlumatları yeniləndi." };
}
