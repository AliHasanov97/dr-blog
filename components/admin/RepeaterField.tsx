"use client";

import { Icon, TextAreaField, TextField } from "@/components/ui";
import type { ResourceField } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export interface RepeaterFieldProps<T> {
  label: string;
  description?: string;
  items: T[];
  fields: ResourceField[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel: string;
  /** Sətrin başlığı — siyahıda göstərilir */
  rowTitle: (item: T, index: number) => string;
}

/** Təkrarlanan qeydlər (kredensial, timeline, sosial kanal) üçün ümumi redaktor */
export function RepeaterField<T>({
  label,
  description,
  items,
  fields,
  onChange,
  makeEmpty,
  addLabel,
  rowTitle,
}: RepeaterFieldProps<T>) {
  function set(index: number, name: string, value: string) {
    onChange(
      items.map((item, i) =>
        i === index ? ({ ...item, [name]: value } as T) : item,
      ),
    );
  }

  function readField(item: T, name: string): string {
    const value = (item as Record<string, unknown>)[name];
    return value === undefined || value === null ? "" : String(value);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col gap-0.5">
        <span className="font-label text-label-md uppercase tracking-wider text-outline">
          {label}
        </span>
        {description && (
          <span className="font-body text-body-sm text-on-surface-variant">
            {description}
          </span>
        )}
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-md border border-surface-container bg-surface-container-low/40 overflow-hidden"
        >
          <div className="flex items-center gap-space-xs px-space-sm h-10 border-b border-surface-container bg-surface-container-lowest">
            <span className="font-label text-label-sm text-on-surface truncate">
              {rowTitle(item, index) || `Qeyd ${index + 1}`}
            </span>
            <span className="ms-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Yuxarı"
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
              >
                <Icon name="keyboard_arrow_up" size={16} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Aşağı"
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
              >
                <Icon name="keyboard_arrow_down" size={16} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Sil"
                className="w-7 h-7 flex items-center justify-center rounded text-error hover:bg-error-container/50"
              >
                <Icon name="delete" size={16} />
              </button>
            </span>
          </div>
          <div className="p-space-sm grid gap-space-sm sm:grid-cols-2">
            {fields.map((field) => {
              const value = readField(item, field.name);
              const span = cn(field.colSpan === 2 && "sm:col-span-2");
              return field.type === "textarea" ? (
                <TextAreaField
                  key={field.name}
                  label={field.label}
                  rows={field.rows ?? 2}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => set(index, field.name, e.target.value)}
                  className={span}
                />
              ) : (
                <TextField
                  key={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => set(index, field.name, e.target.value)}
                  className={span}
                />
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, makeEmpty()])}
        className="inline-flex w-fit items-center gap-1 font-label text-label-md text-secondary hover:underline"
      >
        <Icon name="add" size={16} />
        {addLabel}
      </button>
    </div>
  );
}
