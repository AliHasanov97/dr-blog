"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface HelpNoteProps {
  title: string;
  children: ReactNode;
  /** Açıq başlasın */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * «Bu səhifə nə üçündür?» izahı.
 * Texniki olmayan istifadəçi üçün hər səhifənin başında sadə dildə bələdçi.
 */
export function HelpNote({
  title,
  children,
  defaultOpen = false,
  className,
}: HelpNoteProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-lg border border-secondary/30 bg-secondary/[0.06] overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-space-xs px-space-md py-space-sm text-start"
      >
        <Icon name="help" size={18} className="text-secondary shrink-0" />
        <span className="font-label text-label-lg text-on-secondary-container">
          {title}
        </span>
        <Icon
          name="expand_more"
          size={18}
          className={cn(
            "ms-auto text-secondary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-space-md pb-space-md ps-[2.6rem] font-body text-body-sm text-on-surface-variant leading-relaxed [&_strong]:text-on-surface [&_ul]:mt-space-2xs [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_li]:flex [&_li]:gap-space-2xs">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sahənin altındakı bir sətirlik izah */
export function FieldHint({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-start gap-1 font-label text-label-sm text-outline">
      <Icon name="info" size={13} className="mt-0.5 shrink-0" />
      {children}
    </span>
  );
}
