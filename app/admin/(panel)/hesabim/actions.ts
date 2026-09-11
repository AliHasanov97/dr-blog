"use server";

import { changePassword } from "@/lib/api/auth";
import { getSession } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/admin/types";

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Sessiya bitib — yenidən daxil olun." };
  }

  const result = await changePassword(
    session.user.id,
    currentPassword,
    newPassword,
  );
  return { success: result.success, message: result.message };
}
