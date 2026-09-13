"use client";

import { useCallback } from "react";
import { setCommentLike } from "@/app/[locale]/(site)/articles/[slug]/actions";
import { useLikeCounter } from "./useLikeCounter";

/** Şərhin bəyənilməsi */
export function useCommentLike(commentId: string, initialCount: number) {
  return useLikeCounter({
    key: `dr-liked-comment-${commentId}`,
    initialCount,
    persist: useCallback(
      (liked: boolean) => setCommentLike(commentId, liked),
      [commentId],
    ),
  });
}
