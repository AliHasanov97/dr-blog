/**
 * Hər iki kök layout-un (sayt və admin) `<head>`-inə eyni əlavələr lazımdır —
 * ikon şrift bağlantıları. Təkrarlanmasın deyə bura çıxarılıb.
 *
 * DİQQƏT: tema skripti (`beforeInteractive` strategiyalı `<Script>`) BURA
 * yox, hər kök layout-un ÖZÜNƏ birbaşa yazılır — Next.js `beforeInteractive`
 * skriptlərin birbaşa kök layout faylında olmasını tələb edir (ESLint
 * `@next/next/no-before-interactive-script-outside-document` bunu yoxlayır,
 * komponent araçılığı ilə gizlətmək xəbərdarlıq yaradır).
 */
export function RootHeadAssets() {
  return (
    <>
      {/* Material Symbols — ikon şrifti (next/font ikon şriftlərini dəstəkləmir) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      />
    </>
  );
}
