"use client";

import { useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { sweepMedia } from "./actions";

/**
 * R2-də heç bir qeydə bağlı olmayan faylları tapıb silir.
 *
 * Məqalə/protokol/video/həkim redaktəsində fayl əvəz olunanda köhnəsi
 * dərhal silinir — bu düymə yalnız o axının qaçırdığı halları (məs.
 * məqalə məzmunundan tək bir şəklin silinməsi) təmizləyir.
 */
export function MediaSweepButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function run() {
    startTransition(async () => {
      const res = await sweepMedia();
      if (!res.success) {
        setResult(res.message ?? "Xəta baş verdi.");
        return;
      }
      const parts = [res.message];
      if (typeof res.skippedRecent === "number" && res.skippedRecent > 0) {
        parts.push(`(${res.skippedRecent} fayla toxunulmadı — çox təzədir)`);
      }
      setResult(parts.join(" "));
    });
  }

  return (
    <div className="mt-space-lg rounded-xl border border-surface-container bg-surface-container-lowest p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-2xs font-label text-label-lg text-on-surface">
        <Icon name="mop" size={18} className="text-secondary" />
        Yetim faylları təmizlə
      </div>
      <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
        Məqalə, protokol, video və ya profil redaktəsi zamanı əvəz olunan/silinən
        fayllar adətən dərhal silinir. Bu düymə isə R2-də qalıb heç bir yerdə
        işlədilməyən faylları (məs. məqalə mətnindən silinmiş tək bir şəkli)
        tapıb silir. Son 24 saatda yüklənən fayllara toxunulmur.
      </p>
      <div className="flex items-center gap-space-sm">
        <Button
          variant="secondary"
          size="sm"
          icon="mop"
          disabled={pending}
          onClick={run}
        >
          {pending ? "Yoxlanılır..." : "İndi təmizlə"}
        </Button>
        {result && (
          <span className="font-label text-label-sm text-on-surface-variant">
            {result}
          </span>
        )}
      </div>
    </div>
  );
}
