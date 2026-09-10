"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Oxucunun brauzerində saxlanılan tərcihlər.
 *
 * Sayt qeydiyyatsızdır — istifadəçi hesabı yoxdur, ona görə oxu ölçüsü
 * `localStorage`-də qalır. Vəziyyət modul səviyyəsindədir ki, səhifədəki
 * bütün nəzarətlər eyni mənbədən oxusun.
 */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  /* Başqa tabdakı dəyişiklik də tutulur */
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    /* localStorage bağlıdırsa tərcih sadəcə yadda qalmır */
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* yaddaş yoxdursa da interfeys işləməyə davam edir */
  }
  emit();
}

/* --------------------------------------------------------------
 * Oxu ölçüsü
 * ------------------------------------------------------------ */

export const READING_SIZES = ["sm", "md", "lg", "xl"] as const;
export type ReadingSize = (typeof READING_SIZES)[number];

const SIZE_KEY = "dr-reading-size";
const DEFAULT_SIZE: ReadingSize = "md";

function readSize(): ReadingSize {
  const stored = read(SIZE_KEY);
  return READING_SIZES.includes(stored as ReadingSize)
    ? (stored as ReadingSize)
    : DEFAULT_SIZE;
}

export function useReadingSize() {
  const size = useSyncExternalStore(
    subscribe,
    readSize,
    /* Serverdə tərcih bilinmir — standart ölçü ilə render olunur */
    () => DEFAULT_SIZE,
  );

  const setSize = useCallback((next: ReadingSize) => {
    write(SIZE_KEY, next === DEFAULT_SIZE ? null : next);
  }, []);

  return { size, setSize };
}
