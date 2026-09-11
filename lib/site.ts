export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Ana səhifə", shortLabel: "Ana səhifə", icon: "home" },
  { href: "/meqaleler", label: "Bloq və Elmi Məqalələr", shortLabel: "Məqalələr", icon: "menu_book" },
  { href: "/haqqinda", label: "Haqqında", shortLabel: "Haqqında", icon: "workspace_premium" },
  { href: "/elaqe", label: "Əlaqə", shortLabel: "Əlaqə", icon: "mail" },
];

export const siteConfig = {
  name: "Dr. Ələkbər Zeynili",
  title: "T.e.n., Kardioloq & Terapevt",
  description:
    "Kardiologiya üzrə elmi məqalələr, klinik icmallar və pasiyentlər üçün sübuta əsaslanan sağlamlıq bələdçiləri.",
  emergencyNumber: "103",
} as const;
