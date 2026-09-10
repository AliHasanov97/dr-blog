"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SplashScreenProps {
  text?: string;
  logoUrl?: string;
  showText?: boolean;
  showLogo?: boolean;
}

/**
 * İlk yükləmədə göstərilən splash screen.
 * Logo və/və ya mətn animasiyası göstərir.
 */
export function SplashScreen({ text = "LOADING", logoUrl, showText = true, showLogo = false }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [cycleComplete, setCycleComplete] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const charCount = text.length;
  const typeDuration = charCount * 0.08;
  const holdDuration = 0.5;
  const fadeDuration = 0.3;
  const cycleDuration = typeDuration + holdDuration + fadeDuration + 0.1;
  const oneCycleMs = logoUrl ? 1500 : cycleDuration * 1000; // Logo üçün 1.5s

  // 1 tam dövrə bitdikdə
  useEffect(() => {
    const timer = setTimeout(() => {
      setCycleComplete(true);
    }, oneCycleMs);

    return () => clearTimeout(timer);
  }, [oneCycleMs]);

  // Səhifə tam yükləndikdə
  useEffect(() => {
    const checkLoaded = () => {
      if (document.readyState === "complete") {
        setPageLoaded(true);
      }
    };

    checkLoaded();
    const timer = setTimeout(() => setPageLoaded(true), 100);

    window.addEventListener("load", () => setPageLoaded(true));
    document.addEventListener("readystatechange", checkLoaded);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", () => setPageLoaded(true));
      document.removeEventListener("readystatechange", checkLoaded);
    };
  }, []);

  // Hər iki şərt ödənəndə fade out
  useEffect(() => {
    if (cycleComplete && pageLoaded && !fading) {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    }
  }, [cycleComplete, pageLoaded, fading]);

  if (!visible) return null;

  // Keyframe faizləri (mətn animasiyası üçün)
  const typeEnd = ((typeDuration + 0.1) / cycleDuration) * 100;
  const holdEnd = ((typeDuration + 0.1 + holdDuration) / cycleDuration) * 100;
  const fadeEnd = ((typeDuration + 0.1 + holdDuration + fadeDuration) / cycleDuration) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes splashLoop {
            0% { opacity: 0; transform: translateY(10px); }
            ${typeEnd.toFixed(1)}% { opacity: 1; transform: translateY(0); }
            ${holdEnd.toFixed(1)}% { opacity: 1; transform: translateY(0); }
            ${fadeEnd.toFixed(1)}% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 0; transform: translateY(10px); }
          }
          @keyframes logoPulse {
            0%, 100% { opacity: 0.4; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1); }
          }
        `
      }} />

      <div
        className={cn(
          "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface gap-6",
          "transition-opacity duration-500 ease-out",
          fading && "opacity-0 pointer-events-none"
        )}
      >
        {/* Logo */}
        {showLogo && logoUrl && (
          <img
            src={logoUrl}
            alt="Loading"
            className="h-14 sm:h-18 md:h-20 w-auto object-contain"
            style={{ animation: "logoPulse 1.2s ease-in-out infinite" }}
          />
        )}

        {/* Mətn */}
        {showText && (
          <div className="flex items-center justify-center">
            {text.split("").map((char, i) => (
              <span
                key={i}
                className={cn(
                  "inline-block font-headline font-bold text-primary",
                  showLogo && logoUrl
                    ? "text-2xl sm:text-3xl md:text-4xl"
                    : "text-4xl sm:text-5xl md:text-6xl"
                )}
                style={{
                  opacity: 0,
                  animation: `splashLoop ${cycleDuration}s ease-in-out infinite`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        )}

        {/* Nöqtələr */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-secondary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
