"use server";

import { requestPasswordReset } from "@/lib/api/auth";

export interface ForgotPasswordState {
  error?: string;
  sent?: boolean;
}

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "E-poçt ünvanı daxil edilməlidir." };
  }

  const result = await requestPasswordReset(email);
  if (!result.success) {
    return { error: result.message ?? "Bərpa linki göndərilmədi." };
  }
  return { sent: true };
}
