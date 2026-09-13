"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ButtonLink, Card, Icon } from "@/components/ui";
import { routing } from "@/i18n/routing";
import type { ContactChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ContactChannelCardProps {
  channel: ContactChannel;
  className?: string;
}

export function ContactChannelCard({ channel, className }: ContactChannelCardProps) {
  const locale = useLocale();
  const t = useTranslations("contact.channels");
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  /*
   * `title`/`subtitle`/`actionLabel` bazada yalnız admin-in yazdığı tək
   * dildə saxlanılır — ayrıca dil sahəsi yoxdur. Standart dildən fərqli
   * dillərdə DB mətni əvəzinə kanalın növünə (whatsapp/email/phone) görə
   * hazır tərcümə göstərilir; standart dildə admin-in yazdığı mətn
   * toxunulmadan qalır.
   */
  const useKindLabels = locale !== routing.defaultLocale;
  const title = useKindLabels ? t(`${channel.kind}.title`) : channel.title;
  const subtitle = useKindLabels ? t(`${channel.kind}.subtitle`) : channel.subtitle;
  const actionLabel = useKindLabels ? t(`${channel.kind}.actionLabel`) : channel.actionLabel;

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch {
      setCopiedValue(null);
    }
  }

  return (
    <Card className={cn("flex flex-col gap-space-sm h-full", className)}>
      <div className="flex items-start gap-space-sm">
        <span className="w-11 h-11 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
          <Icon name={channel.icon} size={22} />
        </span>
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-label text-label-lg text-on-surface">
            {title}
          </span>
          <span className="font-body text-body-sm text-on-surface-variant">
            {subtitle}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-space-2xs">
        {channel.values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => copy(value)}
            className="flex items-center justify-between gap-space-xs rounded-md bg-surface-container-low px-space-sm py-2 text-start hover:bg-surface-container transition-colors"
          >
            <span className="font-body text-body-sm text-on-surface truncate">
              {value}
            </span>
            <Icon
              name={copiedValue === value ? "check" : "content_copy"}
              size={16}
              className={copiedValue === value ? "text-secondary" : "text-outline"}
            />
          </button>
        ))}
      </div>

      <ButtonLink
        href={channel.href}
        external
        icon={channel.actionIcon}
        variant="primary"
        size="md"
        fullWidth
        className="mt-auto"
      >
        {actionLabel}
      </ButtonLink>
    </Card>
  );
}
