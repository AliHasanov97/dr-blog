import type { ReactElement } from "react";

/**
 * Emoji bayraqlar Windows-da (Segoe UI Emoji) dəstəklənmir — ona görə
 * həqiqi SVG istifadə olunur, bütün platformalarda eyni çıxır.
 * Həm publik saytda (dil keçidi), həm admin paneldə (məqalə dili)
 * işlədilir — heç bir i18n asılılığı yoxdur.
 */
export function AzFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} aria-hidden="true">
      <rect width="900" height="200" fill="#00b5e2" />
      <rect y="200" width="900" height="200" fill="#e2001a" />
      <rect y="400" width="900" height="200" fill="#00af66" />
      <circle cx="430" cy="300" r="90" fill="#fff" />
      <circle cx="455" cy="300" r="72" fill="#e2001a" />
      <path fill="#fff" d="M500 300 566 274 528 300 566 326Z" />
    </svg>
  );
}

export function RuFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} aria-hidden="true">
      <rect width="900" height="200" fill="#fff" />
      <rect y="200" width="900" height="200" fill="#0039a6" />
      <rect y="400" width="900" height="200" fill="#d52b1e" />
    </svg>
  );
}

export function TrFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} aria-hidden="true">
      <rect width="900" height="600" fill="#e30a17" />
      {/* Crescent */}
      <circle cx="360" cy="300" r="120" fill="#fff" />
      <circle cx="400" cy="300" r="96" fill="#e30a17" />
      {/* Five-pointed star */}
      <path
        fill="#fff"
        d="M500 220 L523 280 L588 280 L536 318 L558 380 L500 345 L442 380 L464 318 L412 280 L477 280 Z"
      />
    </svg>
  );
}

export const FLAGS: Record<"az" | "ru" | "tr", (props: { className?: string }) => ReactElement> = {
  az: AzFlag,
  ru: RuFlag,
  tr: TrFlag,
};