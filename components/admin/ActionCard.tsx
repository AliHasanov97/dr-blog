import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: string;
  /** Diqqət tələb edən sayğac */
  count?: number;
  primary?: boolean;
}

/** «Nə etmək istəyirsiniz?» böyük düymələri */
export function ActionCard({
  href,
  title,
  description,
  icon,
  count,
  primary = false,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-space-sm rounded-xl border p-space-md transition-colors",
        primary
          ? "border-transparent bg-primary-container text-on-primary hover:bg-primary-container/90"
          : "border-surface-container bg-surface-container-lowest hover:border-secondary/40",
      )}
    >
      <span
        className={cn(
          "w-11 h-11 shrink-0 rounded-lg flex items-center justify-center",
          primary
            ? "bg-white/12 text-secondary-fixed"
            : count
              ? "bg-secondary text-on-secondary"
              : "bg-secondary/10 text-secondary",
        )}
      >
        <Icon name={icon} size={22} />
      </span>

      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="flex items-center gap-space-xs">
          <span
            className={cn(
              "font-headline text-headline-sm",
              primary ? "text-on-primary" : "text-on-surface",
            )}
          >
            {title}
          </span>
          {typeof count === "number" && count > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-error text-on-error font-label text-label-sm">
              {count}
            </span>
          )}
        </span>
        <span
          className={cn(
            "font-body text-body-sm leading-snug",
            primary ? "text-on-primary-container" : "text-on-surface-variant",
          )}
        >
          {description}
        </span>
      </span>

      <Icon
        name="arrow_forward"
        size={18}
        className={cn(
          "shrink-0 mt-1 transition-transform group-hover:translate-x-0.5",
          primary ? "text-tertiary-fixed" : "text-secondary",
        )}
      />
    </Link>
  );
}
