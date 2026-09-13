import { AdminPageHeader, HelpNote } from "@/components/admin";
import { listComments } from "@/lib/admin/queries";
import { CommentModerationClient } from "./CommentModerationClient";

export const metadata = { title: "Şərhlər" };

export default async function AdminCommentsPage() {
  const comments = await listComments();
  const pending = comments.filter((c) => c.status === "pending").length;

  return (
    <>
      <AdminPageHeader
        title="Şərh moderasiyası"
        description={
          pending > 0
            ? `${pending} şərh baxış gözləyir`
            : "Bütün şərhlər nəzərdən keçirilib"
        }
        icon="forum"
      />
      <HelpNote title="Şərhlərlə nə etməliyəm?" className="mb-space-md">
        <ul>
          <li>
            <strong>Təsdiqlə</strong> — şərh saytda məqalənin altında görünür.
          </li>
          <li>
            <strong>Rədd et</strong> — şərh saytda göstərilmir, amma silinmir
            (fikrinizi dəyişsəniz təsdiqləyə bilərsiniz).
          </li>
          <li>
            <strong>Cavabla</strong> — sizin adınızdan rəsmi cavab yazılır, şərhin
            altında yaşıl nişanla görünür.
          </li>
        </ul>
        <p className="mt-space-2xs">
          Yeni şərhlər siz təsdiqləyənə qədər saytda görünmür.
        </p>
      </HelpNote>
      <CommentModerationClient comments={comments} />
    </>
  );
}
