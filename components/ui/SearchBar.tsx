"use client";

import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Sağdakı filtr düyməsi */
  onFilterClick?: () => void;
  className?: string;
  /**
   * Admin panel və sayt bu komponenti paylaşır, admin `next-intl` provider-i
   * olmadığı üçün defolt dəyərlər sabit qalır — sayt çağıranları öz tərcümə
   * mətnlərini bu proplarla veriməlidir.
   */
  clearLabel?: string;
  filterLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Axtarış...",
  onFilterClick,
  className,
  clearLabel = "Axtarışı təmizlə",
  filterLabel = "Filtrlər",
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center w-full h-12 px-space-md rounded-xl",
        "bg-surface-container-low text-on-surface shadow-sm transition-all",
        "focus-within:bg-surface-container-lowest focus-within:shadow-level-1",
        "focus-within:ring-1 focus-within:ring-primary/40",
        className,
      )}
    >
      <Icon name="search" size={20} className="text-outline mr-space-xs" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent border-none outline-none font-body text-body-sm placeholder:text-outline text-on-surface"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={clearLabel}
          className="text-outline hover:text-on-surface"
        >
          <Icon name="close" size={18} />
        </button>
      )}
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label={filterLabel}
          className="ml-space-xs flex items-center justify-center text-outline hover:text-secondary"
        >
          <Icon name="tune" size={20} />
        </button>
      )}
    </div>
  );
}
