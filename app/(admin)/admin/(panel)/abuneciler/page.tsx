import { AdminPageHeader, HelpNote, StatCard } from "@/components/admin";
import { listSubscribers } from "@/lib/admin/queries";
import { SubscriberListClient } from "./SubscriberListClient";
import { NewsletterComposer } from "./NewsletterComposer";

export const metadata = { title: "Abunəçilər" };

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();
  const active = subscribers.filter((s) => s.isActive).length;

  return (
    <>
      <AdminPageHeader
        title="Bülleten abunəçiləri"
        description="Saytdakı abunə formasından gələn e-poçtlar"
        icon="mail"
      />

      <div className="grid gap-space-md sm:grid-cols-3 mb-space-lg">
        <StatCard label="Ümumi" value={subscribers.length} icon="group" />
        <StatCard label="Aktiv" value={active} icon="mark_email_read" />
        <StatCard
          label="Dayandırılıb"
          value={subscribers.length - active}
          icon="unsubscribe"
        />
      </div>

      <NewsletterComposer activeCount={active} />

      <HelpNote title="Bu siyahı nə üçündür?" className="mb-space-md">
        <p>
          Saytdakı «Həftəlik Tibbi Bülleten» formasını dolduran oxucuların
          e-poçt ünvanları. Bülleteni yuxarıdakı formadan birbaşa göndərə
          bilərsiniz; «Aktiv e-poçtları kopyala» düyməsi isə siyahını öz poçt
          proqramınızda işlətmək üçündür.
        </p>
      </HelpNote>
      <SubscriberListClient subscribers={subscribers} />
    </>
  );
}
