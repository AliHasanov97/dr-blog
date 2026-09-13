export interface NavItem {
  href: string;
  /** `nav` mesaj namespace-indəki açar — label/shortLabel buradan gəlir (bax: messages/*.json) */
  key: "home" | "articles" | "about" | "contact";
  icon: string;
}

/** Label/shortLabel `nav` tərcümə namespace-indən gəlir — bax: components/layout/SiteHeader.tsx və s. */
export const navItems: NavItem[] = [
  { href: "/", key: "home", icon: "home" },
  { href: "/articles", key: "articles", icon: "menu_book" },
  { href: "/about", key: "about", icon: "workspace_premium" },
  { href: "/contact", key: "contact", icon: "mail" },
];

export const siteConfig = {
  name: "Dr. Ələkbər Zeynili",
  title: "T.e.n., Kardioloq & Terapevt",
  description:
    "Kardiologiya üzrə elmi məqalələr, klinik icmallar və pasiyentlər üçün sübuta əsaslanan sağlamlıq bələdçiləri.",
  emergencyNumber: "103",
} as const;
