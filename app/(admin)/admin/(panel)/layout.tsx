import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell, LanguageSupportProvider } from "@/components/admin";
import type { AdminNavGroup } from "@/components/admin";
import { logoutAction } from "@/app/(admin)/admin/login/actions";
import { getSession } from "@/lib/auth";
import { getDashboardStats, getDoctorProfile, getSiteSettings } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: { default: "İdarə paneli", template: "%s | İdarə paneli" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [doctor, stats, settings] = await Promise.all([
    getDoctorProfile(),
    getDashboardStats(),
    getSiteSettings(),
  ]);
  const { pendingComments, newMessages } = stats;

  const groups: AdminNavGroup[] = [
    {
      title: "Başlanğıc",
      items: [{ href: "/admin", label: "Ana səhifə", icon: "home" }],
    },
    {
      title: "Yazılarım",
      items: [
        { href: "/admin/meqaleler", label: "Məqalələr", icon: "article" },
        { href: "/admin/videolar", label: "Videolar", icon: "smart_display" },
        { href: "/admin/protokollar", label: "PDF sənədlər", icon: "picture_as_pdf" },
        { href: "/admin/kateqoriyalar", label: "Mövzular", icon: "sell" },
      ],
    },
    {
      title: "Oxucular",
      items: [
        {
          href: "/admin/serhler",
          label: "Şərhlər",
          icon: "forum",
          badge: pendingComments || undefined,
        },
        {
          href: "/admin/muracietler",
          label: "Gələn məktublar",
          icon: "inbox",
          badge: newMessages || undefined,
        },
        { href: "/admin/abuneciler", label: "Bülleten abunəçiləri", icon: "mail" },
      ],
    },
    {
      title: "Sayt məlumatları",
      items: [
        { href: "/admin/hekim", label: "Mənim profilim", icon: "badge" },
        { href: "/admin/elaqe", label: "Əlaqə və suallar", icon: "contact_support" },
        { href: "/admin/parametrler", label: "Tənzimləmələr", icon: "settings" },
      ],
    },
  ];

  return (
    <LanguageSupportProvider enabled={settings.multiLanguageEnabled}>
      <AdminShell
        user={session.user}
        doctorName={doctor?.fullName || "Həkim"}
        groups={groups}
        logoutAction={logoutAction}
      >
        {children}
      </AdminShell>
    </LanguageSupportProvider>
  );
}
