"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ShareCardProps {
  title: string;
  /**
   * Boş buraxılsa cari səhifə URL-i istifadə olunur.
   * Mümkünsə server tərəfdən ötürün (məs. `siteUrl() + pathname`) — əks
   * halda ilk render `window.location.href`-i bilmir (server-də `window`
   * yoxdur) və React-in hidratasiya xətası verir.
   */
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

/** Heç bir hadisəyə abunə olmur — sadəcə mount zamanı bir dəfə oxunur */
function noopSubscribe() {
  return () => {};
}

function getCurrentUrl() {
  return window.location.href;
}

function getServerUrl() {
  return "";
}

export function ShareCard({
  title,
  url,
  description = "Ürək sağlamlığı haqqında sübutlu elmi protokolları pasiyentləriniz və yaxınlarınızla paylaşın:",
  className,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  /*
   * `url` verilməyibsə cari səhifə ünvanı lazımdır, amma server-də `window`
   * yoxdur. `useSyncExternalStore` server/client fərqini təhlükəsiz idarə
   * edir: server "" bilir, hidratasiyadan dərhal sonra həqiqi ünvana keçir
   * — `window.location.href`-i birbaşa render zamanı oxumaq React-in
   * hidratasiya xətasına səbəb olardı.
   */
  const currentUrl = useSyncExternalStore(noopSubscribe, getCurrentUrl, getServerUrl);
  const resolvedUrl = url ?? currentUrl;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
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
            href={ch.href(resolvedUrl, title)}
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
