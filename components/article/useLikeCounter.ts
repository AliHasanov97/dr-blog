"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Bəyənmə sayğacının müştəri tərəfi (məqalə və şərhlər üçün ortaqdır).
 *
 * Sayt qeydiyyatsızdır, ona görə «bu oxucu bəyənib» faktı brauzerdə
 * (`localStorage`), ümumi say isə serverdə saxlanılır.
 *
 * Vəziyyət komponentin içində yox, modul səviyyəsində saxlanılır: eyni
 * elementin bir neçə düyməsi ola bilər (məqalədə mobil alt panel və
 * desktop statistika kartı). Hamısı eyni mənbədən oxuyur ki, saylar
 * bir-birindən sürüşməsin.
 */
const overrides = new Map<string, number>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  /* Başqa tabda edilən dəyişiklik də tutulur */
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readLiked(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    /* localStorage bağlıdırsa bəyənmə sadəcə yadda qalmır */
    return false;
  }
}

export interface LikeCounterOptions {
  /** `localStorage` açarı — eyni zamanda daxili sayğac açarıdır */
  key: string;
  /** Serverdən gələn cari say */
  initialCount: number;
  /** Serverdə yadda saxlayır və dəqiq sayı qaytarır */
  persist: (liked: boolean) => Promise<number | null>;
}

export function useLikeCounter({
  key,
  initialCount,
  persist,
}: LikeCounterOptions) {
  const liked = useSyncExternalStore(
    subscribe,
    useCallback(() => readLiked(key), [key]),
    /* Serverdə oxucunun kim olduğu bilinmir — həmişə «bəyənilməyib» */
    () => false,
  );

  const count = useSyncExternalStore(
    subscribe,
    useCallback(
      () => overrides.get(key) ?? initialCount,
      [key, initialCount],
    ),
    () => initialCount,
  );

  const toggle = useCallback(async () => {
    const next = !readLiked(key);

    /* Dərhal görünən cavab — server gözlənilmir */
    overrides.set(
      key,
      Math.max(0, (overrides.get(key) ?? initialCount) + (next ? 1 : -1)),
    );
    try {
      window.localStorage.setItem(key, next ? "1" : "0");
    } catch {
      /* yaddaş yoxdursa da əməliyyat davam edir */
    }
    emit();

    /* Server dəqiq sayı qaytaranda onunla əvəz olunur */
    const exact = await persist(next);
    if (typeof exact === "number") {
      overrides.set(key, exact);
      emit();
    }
  }, [key, initialCount, persist]);

  return { liked, count, toggle };
}
