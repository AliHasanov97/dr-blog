"use server";

import { resetPassword } from "@/lib/api/auth";

export interface ResetPasswordState {
  error?: string;
  done?: boolean;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) {
    return { error: "Link etibarsızdır. Yenidən bərpa tələb edin." };
  }
  if (password.length < 8) {
    return { error: "Şifrə ən azı 8 simvol olmalıdır." };
  }
  if (password !== confirm) {
    return { error: "Şifrələr üst-üstə düşmür." };
  }

  const result = await resetPassword(token, password);
  if (!result.success) {
    return { error: result.message ?? "Şifrə yenilənmədi." };
  }
  return { done: true };
}
