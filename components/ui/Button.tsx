"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "tonal";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  // DESIGN.md — Primary Consultation Action
  primary:
    "bg-primary-container text-on-primary border border-tertiary-fixed-dim/30 hover:bg-primary-container/90 active:scale-[0.98] active:bg-primary-container/80 shadow-sm",
  // Secondary Clinical Action
  secondary:
    "bg-surface-container-lowest text-on-surface border border-on-surface/20 hover:bg-surface-container-low active:scale-[0.98] active:bg-surface-container",
  // Tertiary / Ghost Action
  ghost: "bg-transparent text-secondary hover:bg-secondary/8 active:scale-[0.98] active:bg-secondary/12",
  tonal:
    "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:scale-[0.98] active:bg-secondary-container/70",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-space-sm text-label-md gap-1",
  md: "h-11 px-space-md text-label-lg gap-space-2xs",
  lg: "h-12 px-space-lg text-label-lg gap-space-xs",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {}

export interface ButtonLinkProps extends CommonProps {
  href: string;
  external?: boolean;
}

function baseClass({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: CommonProps) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-label font-semibold",
    "transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={baseClass({ variant, size, fullWidth, className, children })}
    >
      {icon && iconPosition === "start" && <Icon name={icon} size={18} />}
      {children}
      {icon && iconPosition === "end" && <Icon name={icon} size={18} />}
    </button>
  );
}

export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "start",
  fullWidth,
  className,
  children,
}: ButtonLinkProps) {
  const cls = baseClass({ variant, size, fullWidth, className, children });

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {icon && iconPosition === "start" && <Icon name={icon} size={18} />}
        {children}
        {icon && iconPosition === "end" && <Icon name={icon} size={18} />}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {icon && iconPosition === "start" && <Icon name={icon} size={18} />}
      {children}
      {icon && iconPosition === "end" && <Icon name={icon} size={18} />}
    </Link>
  );
}
