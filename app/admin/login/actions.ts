"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/api/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

export interface LoginState {
  error?: string;
}

/** Giriş formu üçün Server Action (useActionState ilə işləyir) */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "E-poçt və şifrə daxil edilməlidir." };
  }

  const result = await login(email, password);
  if (!result.success || !result.session) {
    return { error: result.message ?? "Giriş alınmadı." };
  }

  await setSessionCookie(result.session);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
