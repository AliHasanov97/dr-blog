/**
 * Sessiya cookie-sinin adı — ayrıca fayldadır ki, Edge Runtime-da işləyən
 * `middleware.ts` `lib/auth/session.ts`-i (və onun `node:crypto`
 * asılılığını, Edge-də dəstəklənmir) importa məcbur qalmasın.
 */
export const SESSION_COOKIE = "dr_admin_session";
