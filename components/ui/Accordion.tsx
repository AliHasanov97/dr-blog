"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  question: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  question,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "border-b border-outline-variant/60 last:border-b-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-space-sm py-space-sm text-start"
      >
        <span className="font-headline text-headline-sm text-on-surface leading-snug">
          {question}
        </span>
        <Icon
          name="expand_more"
          size={22}
          className={cn(
            "text-outline transition-transform duration-300",
            open && "rotate-180 text-secondary",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-space-md font-body text-body-md text-on-surface-variant leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

/** Başlıq + ikon ilə açılan panel (istinadlar, məzmun siyahısı) */
export function CollapsiblePanel({
  title,
  icon,
  defaultOpen = false,
  children,
  className,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const root = useRef<HTMLDivElement>(null);

  /**
   * Panel bağlı olanda da içindəki anchor-a keçid işləsin —
   * məsələn məqalə mətnindəki `[ref=2]` istinad siyahısına tullayır.
   */
  useEffect(() => {
    function openIfTargeted() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target || !root.current?.contains(target)) return;
      setOpen(true);
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    }
    openIfTargeted();
    window.addEventListener("hashchange", openIfTargeted);
    return () => window.removeEventListener("hashchange", openIfTargeted);
  }, []);

  return (
    <div
      ref={root}
      className={cn(
        "rounded-xl border border-surface-container bg-surface-container-low overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-space-sm px-space-md py-space-sm text-start"
      >
        <span className="flex items-center gap-space-xs min-w-0">
          {icon && <Icon name={icon} size={18} className="text-secondary" />}
          <span className="font-label text-label-lg text-on-surface truncate">
            {title}
          </span>
        </span>
        <Icon
          name="expand_more"
          size={20}
          className={cn(
            "text-outline transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-space-md pb-space-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
