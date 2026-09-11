"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar, type AdminNavGroup } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import type { AdminUser } from "@/lib/auth/types";

export interface AdminShellProps {
  user: AdminUser;
  doctorName: string;
  groups: AdminNavGroup[];
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

export function AdminShell({ user, doctorName, groups, logoutAction, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar
        doctorName={doctorName}
        groups={groups}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:ps-64 flex flex-col min-h-screen">
        <AdminTopbar
          user={user}
          onMenuClick={() => setMenuOpen(true)}
          logoutAction={logoutAction}
        />
        <main className="flex-1 p-space-md lg:p-space-lg">
          <div className="mx-auto w-full max-w-[80rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
