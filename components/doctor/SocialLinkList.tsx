import { Card, Icon } from "@/components/ui";
import type { SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SocialLinkListProps {
  links: SocialLink[];
  className?: string;
}

export function SocialLinkList({ links, className }: SocialLinkListProps) {
  return (
    <Card padded={false} className={cn("divide-y divide-surface-container", className)}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-space-md p-space-md hover:bg-surface-container-low/60 transition-colors"
        >
          <span className="w-10 h-10 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Icon name={link.icon} size={20} />
          </span>
          <span className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="font-label text-label-lg text-on-surface truncate">
              {link.platform}
              {link.handle && (
                <span className="text-outline font-normal"> ({link.handle})</span>
              )}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant truncate">
              {link.description}
            </span>
          </span>
          <Icon name="arrow_forward" size={18} className="text-secondary shrink-0" />
        </a>
      ))}
    </Card>
  );
}
