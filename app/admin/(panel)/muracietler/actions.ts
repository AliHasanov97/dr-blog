"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/admin/types";
import { store, type MessageStatus } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { dbUpdateMessageStatus, dbDeleteMessage } from "@/lib/db/admin";

export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      await dbUpdateMessageStatus(id, status);
      revalidatePath("/admin/muracietler");
      revalidatePath("/admin");
      return { success: true };
    } catch (error) {
      console.error("Set message status error:", error);
      return { success: false, message: "Müraciət tapılmadı." };
    }
  }

  const message = store.messages.find((m) => m.id === id);
  if (!message) return { success: false, message: "Müraciət tapılmadı." };
  message.status = status;
  revalidatePath("/admin/muracietler");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  if (!USE_MOCK) {
    try {
      await dbDeleteMessage(id);
      revalidatePath("/admin/muracietler");
      revalidatePath("/admin");
      return { success: true };
    } catch (error) {
      console.error("Delete message error:", error);
      return { success: false, message: "Müraciət tapılmadı." };
    }
  }

  const index = store.messages.findIndex((m) => m.id === id);
  if (index === -1) return { success: false, message: "Müraciət tapılmadı." };
  store.messages.splice(index, 1);
  revalidatePath("/admin/muracietler");
  revalidatePath("/admin");
  return { success: true };
}
