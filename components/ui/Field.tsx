"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------
 * Ümumi sahə örtüyü (label + xəta mesajı)
 * ----------------------------------------------------------- */

interface FieldShellProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-space-2xs", className)}>
      <label
        htmlFor={htmlFor}
        className="font-label text-label-md text-on-surface-variant"
      >
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
      {error ? (
        <span className="flex items-center gap-1 font-label text-label-sm text-error">
          <Icon name="error" size={13} />
          {error}
        </span>
      ) : hint ? (
        <span className="font-label text-label-sm text-outline">{hint}</span>
      ) : null}
    </div>
  );
}

/** DESIGN.md — Form Inputs & Appointment Selectors */
const controlClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-md bg-surface-container-lowest px-space-sm py-space-sm",
    "font-body text-body-md text-on-surface placeholder:text-outline",
    "border transition-all outline-none",
    invalid
      ? "border-error focus:ring-2 focus:ring-error/25"
      : "border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-tertiary-fixed-dim/50",
  );

/* -------------------------------------------------------------
 * Input
 * ----------------------------------------------------------- */

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
  icon?: string;
  className?: string;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  className,
  id,
  required,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <div className="relative">
        <input
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClass(Boolean(error)), icon && "pr-10")}
          {...props}
        />
        {icon && (
          <Icon
            name={icon}
            size={18}
            className="absolute right-space-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          />
        )}
      </div>
    </FieldShell>
  );
}

/* -------------------------------------------------------------
 * Textarea
 * ----------------------------------------------------------- */

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  id,
  required,
  rows = 5,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(controlClass(Boolean(error)), "resize-y")}
        {...props}
      />
    </FieldShell>
  );
}

/* -------------------------------------------------------------
 * Select
 * ----------------------------------------------------------- */

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  hint?: string;
  className?: string;
}

export function SelectField({
  label,
  options,
  error,
  hint,
  className,
  id,
  required,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClass(Boolean(error)), "appearance-none pr-10")}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          size={20}
          className="absolute right-space-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none"
        />
      </div>
    </FieldShell>
  );
}

/* -------------------------------------------------------------
 * Checkbox
 * ----------------------------------------------------------- */

export interface CheckboxFieldProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  error,
  className,
}: CheckboxFieldProps) {
  const fieldId = useId();
  return (
    <div className={cn("flex flex-col gap-space-2xs", className)}>
      <label
        htmlFor={fieldId}
        className="flex items-start gap-space-xs cursor-pointer"
      >
        <input
          id={fieldId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-outline accent-[#1b6b51]"
        />
        <span className="font-body text-body-sm text-on-surface-variant leading-relaxed">
          {label}
        </span>
      </label>
      {error && (
        <span className="flex items-center gap-1 font-label text-label-sm text-error">
          <Icon name="error" size={13} />
          {error}
        </span>
      )}
    </div>
  );
}
