"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "themechange";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getSnapshot(): boolean {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

/** Server həmişə açıq temanı göstərir — real seçim yalnız müştəridə bəllidir */
function getServerSnapshot(): boolean {
  return false;
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    /* Gizli/məhdud brauzer rejimi — tema sadəcə bu ziyarət üçün tətbiq olunur */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Açıq/tünd tema açarı.
 *
 * Default HƏMİŞƏ açıqdır — yalnız istifadəçi özü seçəndə tünd olur, seçim
 * `localStorage`-da saxlanılır. `useSyncExternalStore` server və müştəri
 * arasındakı fərqi (server həmişə "açıq" bilir, müştəri isə həqiqi
 * saxlanmış dəyəri) təhlükəsiz idarə edir — hidratasiyadan dərhal sonra
 * özü düzəlir (bax: `app/layout.tsx`-dəki FOUC-önləyici skript, o, boyanmazdan
 * əvvəl `<html>`-ə `data-theme` qoyur ki, görünüş "atlamasın").
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => applyTheme(!dark)}
      aria-label={dark ? "Açıq temaya keç" : "Tünd temaya keç"}
      title={dark ? "Açıq temaya keç" : "Tünd temaya keç"}
      className={cn(
        "w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-low transition-colors",
        className,
      )}
    >
      <Icon name={dark ? "light_mode" : "dark_mode"} size={22} />
    </button>
  );
}
