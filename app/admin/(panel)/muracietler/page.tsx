import { AdminPageHeader, HelpNote } from "@/components/admin";
import { listMessages } from "@/lib/admin/queries";
import { MessageInboxClient } from "./MessageInboxClient";

export const metadata = { title: "Müraciətlər" };

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <>
      <AdminPageHeader
        title="Gələn məktublar"
        description={
          unread > 0
            ? `${unread} yeni müraciət cavab gözləyir`
            : "Yeni müraciət yoxdur"
        }
        icon="inbox"
      />
      <HelpNote title="Bu səhifə necə işləyir?" className="mb-space-md">
        <p>
          Saytdakı əlaqə formasından göndərilən məktublar buraya düşür. Məktuba
          klikləyəndə tam mətni açılır və avtomatik «oxunub» kimi işarələnir.
        </p>
        <ul>
          <li>
            <strong>Cavab yaz</strong> — poçt proqramınızı açır və cavab məktubunu
            hazırlayır.
          </li>
          <li>
            <strong>Arxivə at</strong> — işini bitirdiyiniz məktubları gözdən
            uzaqlaşdırır, amma silmir.
          </li>
        </ul>
      </HelpNote>
      <MessageInboxClient messages={messages} />
    </>
  );
}
