export type AdminRole = "admin" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl?: string;
}

export interface AdminSession {
  user: AdminUser;
  /** Unix ms — bitmə vaxtı */
  expiresAt: number;
  /** C# API-dən gələcək JWT üçün yer (mock-da boşdur) */
  accessToken?: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  session?: AdminSession;
}

export const roleLabels: Record<AdminRole, string> = {
  admin: "Administrator",
  editor: "Redaktor",
};
