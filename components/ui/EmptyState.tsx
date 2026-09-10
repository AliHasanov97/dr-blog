import { Icon } from "./Icon";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({
  icon = "search_off",
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-space-xs py-space-2xl px-space-md rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50">
      <Icon name={icon} size={40} className="text-outline" />
      <h3 className="font-headline text-headline-sm text-on-surface">{title}</h3>
      {description && (
        <p className="font-body text-body-sm text-on-surface-variant max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
