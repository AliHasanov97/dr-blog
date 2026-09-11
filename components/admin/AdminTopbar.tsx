"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import type { AdminUser } from "@/lib/auth/types";
import { roleLabels } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

export interface AdminTopbarProps {
  user: AdminUser;
  onMenuClick: () => void;
  /** Server action: sessiyanı bitirir */
  logoutAction: () => Promise<void>;
}

export function AdminTopbar({ user, onMenuClick, logoutAction }: AdminTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-space-sm px-space-md lg:px-space-lg bg-surface-bright/90 backdrop-blur-xl border-b border-surface-container">
      <button
        type="button"
        onClick={onMenuClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          onMenuClick();
        }}
        aria-label="Menyu"
        className="lg:hidden w-12 h-12 flex items-center justify-center rounded-md text-on-surface hover:bg-surface-container-low active:bg-surface-container touch-manipulation select-none"
      >
        <Icon name="menu" size={24} />
      </button>

      <div className="ms-auto flex items-center gap-space-xs">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className={cn(
              "flex items-center gap-space-xs h-10 ps-space-2xs pe-space-sm rounded-full border transition-colors",
              menuOpen
                ? "border-secondary/40 bg-secondary/8"
                : "border-outline-variant hover:bg-surface-container-low",
            )}
          >
            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label text-label-md">
              {user.fullName
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="font-label text-label-md text-on-surface">
                {user.fullName}
              </span>
              <span className="font-label text-label-sm text-outline">
                {roleLabels[user.role]}
              </span>
            </span>
            <Icon name="expand_more" size={18} className="text-outline" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Bağla"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute end-0 top-12 z-50 w-60 rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 overflow-hidden">
                <div className="px-space-md py-space-sm border-b border-surface-container">
                  <p className="font-label text-label-lg text-on-surface truncate">
                    {user.fullName}
                  </p>
                  <p className="font-body text-body-sm text-outline truncate">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/admin/hesabim"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-space-xs px-space-md py-space-sm font-label text-label-lg text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <Icon name="lock_reset" size={18} />
                  Şifrəni dəyiş
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-space-xs px-space-md py-space-sm font-label text-label-lg text-error hover:bg-error-container/40 transition-colors"
                  >
                    <Icon name="logout" size={18} />
                    Çıxış et
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
