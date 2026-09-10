"use client";

import { useState } from "react";
import { Card, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ShareCardProps {
  title: string;
  /** Boş buraxılsa cari səhifə URL-i istifadə olunur */
  url?: string;
  description?: string;
  className?: string;
}

const channels = [
  { id: "whatsapp", icon: "chat", label: "WhatsApp", href: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: "telegram", icon: "send", label: "Telegram", href: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: "facebook", icon: "public", label: "Facebook", href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: "linkedin", icon: "work", label: "LinkedIn", href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
] as const;

export function ShareCard({
  title,
  url,
  description = "Ürək sağlamlığı haqqında sübutlu elmi protokolları pasiyentləriniz və yaxınlarınızla paylaşın:",
  className,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  function resolveUrl() {
    if (url) return url;
    return typeof window === "undefined" ? "" : window.location.href;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className={cn("flex flex-col gap-space-sm", className)}>
      <span className="flex items-center gap-space-xs">
        <Icon name="share" size={20} className="text-secondary" />
        <span className="font-headline text-headline-sm text-on-surface">
          Məqaləni Paylaşın
        </span>
      </span>
      <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
        {description}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs">
        {channels.map((ch) => (
          <a
            key={ch.id}
            href={ch.href(resolveUrl(), title)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 h-16 rounded-lg border border-surface-container bg-surface-container-low hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
          >
            <Icon name={ch.icon} size={20} className="text-on-surface-variant" />
            <span className="font-label text-label-sm text-on-surface-variant">
              {ch.label}
            </span>
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="flex flex-col items-center justify-center gap-1 h-16 rounded-lg border border-surface-container bg-surface-container-low hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
        >
          <Icon name={copied ? "check_circle" : "link"} size={20} className={copied ? "text-secondary" : "text-on-surface-variant"} />
          <span className="font-label text-label-sm text-on-surface-variant">
            {copied ? "Kopyalandı" : "Linki kopyala"}
          </span>
        </button>
      </div>
    </Card>
  );
}
