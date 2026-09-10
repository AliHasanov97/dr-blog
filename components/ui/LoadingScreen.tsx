"use client";

import { cn } from "@/lib/utils";

export interface LoadingScreenProps {
  text?: string;
  className?: string;
}

/**
 * Tam ekran loading animasiyası (Next.js loading.tsx üçün).
 */
export function LoadingScreen({ text = "LOADING", className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface",
        className
      )}
    >
      <div className="flex items-center justify-center">
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary animate-pulse"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
