import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon?: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "flex items-start gap-space-sm rounded-lg border p-space-sm text-start transition-colors",
        checked
          ? "border-secondary/40 bg-secondary/[0.08]"
          : "border-outline-variant/50 hover:bg-surface-container-low",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md shrink-0",
          checked ? "bg-secondary/15 text-secondary" : "bg-surface-container text-outline",
        )}
      >
        <Icon name={icon ?? (checked ? "check_circle" : "radio_button_unchecked")} size={20} />
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-label text-label-md text-on-surface">{label}</span>
        {hint && (
          <span className="font-body text-body-sm text-outline leading-snug">{hint}</span>
        )}
      </span>
      <Icon
        name={checked ? "toggle_on" : "toggle_off"}
        size={28}
        className={cn("shrink-0 mt-0.5", checked ? "text-secondary" : "text-outline")}
      />
    </button>
  );
}
