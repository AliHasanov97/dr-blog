import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------
 * Kiçik alət komponentləri
 * ------------------------------------------------------------ */

export function TDivider() {
  return <span aria-hidden="true" className="w-px h-5 bg-outline-variant mx-0.5" />;
}

export function TButton({
  icon,
  title,
  active = false,
  onClick,
}: {
  icon: string;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded transition-colors",
        active
          ? "bg-secondary text-on-secondary"
          : "text-on-surface-variant hover:bg-surface-container hover:text-secondary",
      )}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

export function TDropdown({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-8 px-1.5 flex items-center gap-0.5 rounded transition-colors",
          open
            ? "bg-secondary/12 text-secondary"
            : "text-on-surface-variant hover:bg-surface-container hover:text-secondary",
        )}
      >
        <Icon name={icon} size={17} />
        <Icon name="arrow_drop_down" size={14} />
      </button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          />
          <div
            className="absolute z-30 top-9 start-0 w-52 rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 p-1 flex flex-col"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export function TRow({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-space-xs px-space-xs h-8 rounded font-label text-label-md text-on-surface hover:bg-surface-container text-start"
    >
      {children}
    </button>
  );
}
