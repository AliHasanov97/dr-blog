import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  /** Sağ tərəfdəki əməliyyat düymələri */
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start sm:justify-between mb-space-lg">
      <div className="flex items-start gap-space-sm min-w-0">
        {icon && (
          <span className="w-10 h-10 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <Icon name={icon} size={20} />
          </span>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="font-body text-body-sm text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-space-xs shrink-0">{actions}</div>
      )}
    </div>
  );
}
