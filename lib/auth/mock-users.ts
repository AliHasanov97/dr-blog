import type { AdminUser } from "./types";

/**
 * MOCK istifadəçilər.
 * Şifrələr yalnız demo üçün açıq saxlanılır — C# API qoşulanda bu fayl silinir
 * və doğrulama serverdə (hash + JWT) aparılır.
 */
export interface MockCredential {
  user: AdminUser;
  password: string;
}

export const mockCredentials: MockCredential[] = [
  {
    user: {
      id: "usr-1",
      email: "admin@drnarmin.az",
      fullName: "Dr. Ələkbər Zeynili",
      role: "admin",
      avatarUrl: "/images/doctor-avatar.svg",
    },
    password: "Admin123!",
  },
  {
    user: {
      id: "usr-2",
      email: "redaktor@drnarmin.az",
      fullName: "Aygün Məmmədova",
      role: "editor",
    },
    password: "Redaktor123!",
  },
];

/** Login səhifəsində göstərilən demo məlumatları */
export const demoAccounts = mockCredentials.map((c) => ({
  email: c.user.email,
  password: c.password,
  role: c.user.role,
  fullName: c.user.fullName,
}));
