"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
  /** Sağda göstərilən sayğac (gözləyən şərh, yeni müraciət) */
  badge?: number;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export interface AdminSidebarProps {
  doctorName: string;
  groups: AdminNavGroup[];
  /** Mobil çekmecə açıqdır */
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ doctorName, groups, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobil fon */}
      {open && (
        <button
          type="button"
          aria-label="Menyunu bağla"
          onClick={onClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="lg:hidden fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm touch-manipulation"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-primary-container text-on-primary",
          "transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center gap-space-xs px-space-md border-b border-white/10 shrink-0">
          <span className="w-8 h-8 rounded-md bg-secondary/20 flex items-center justify-center text-secondary-fixed">
            <Icon name="monitor_heart" size={18} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-headline text-headline-sm text-on-primary leading-none truncate">
              İdarə paneli
            </span>
            <span className="font-label text-label-sm text-on-primary-container truncate">
              {doctorName}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            aria-label="Bağla"
            className="lg:hidden ms-auto w-11 h-11 flex items-center justify-center rounded-md text-on-primary-container hover:text-on-primary active:bg-white/10 touch-manipulation select-none"
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto py-space-md px-space-xs scrollbar-none"
          aria-label="Admin naviqasiyası"
        >
          {groups.map((group) => (
            <div key={group.title} className="mb-space-md last:mb-0">
              <span className="block px-space-sm pb-space-2xs font-label text-label-sm uppercase tracking-[0.14em] text-on-primary-container/70">
                {group.title}
              </span>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-space-xs px-space-sm h-11 rounded-md font-label text-label-lg transition-colors active:scale-[0.98]",
                          active
                            ? "bg-white/12 text-on-primary font-semibold"
                            : "text-on-primary-container hover:bg-white/[0.07] hover:text-on-primary active:bg-white/10",
                        )}
                      >
                        <Icon name={item.icon} size={18} />
                        <span className="truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="ms-auto inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-secondary text-on-secondary font-label text-label-sm">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-space-xs border-t border-white/10 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-space-xs px-space-sm h-11 rounded-md font-label text-label-lg text-on-primary-container hover:bg-white/[0.07] hover:text-on-primary active:bg-white/10 transition-colors"
          >
            <Icon name="open_in_new" size={18} />
            Saytı aç
          </Link>
        </div>
      </aside>
    </>
  );
}
