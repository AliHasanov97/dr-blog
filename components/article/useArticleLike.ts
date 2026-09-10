"use client";

import { useCallback } from "react";
import { setArticleLike } from "@/app/(site)/meqaleler/[slug]/actions";
import { useLikeCounter } from "./useLikeCounter";

/** Məqalənin bəyənilməsi */
export function useArticleLike(slug: string, initialCount: number) {
  return useLikeCounter({
    key: `dr-liked-${slug}`,
    initialCount,
    persist: useCallback(
      (liked: boolean) => setArticleLike(slug, liked),
      [slug],
    ),
  });
}
