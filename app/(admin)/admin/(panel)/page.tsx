import Link from "next/link";
import {
  ActionCard,
  AdminCard,
  HelpNote,
  StatCard,
  StatusPill,
} from "@/components/admin";
import { Icon } from "@/components/ui";
import {
  getDashboardStats,
  listArticles,
  listComments,
  listMessages,
} from "@/lib/admin/queries";
import { articleStatusLabels } from "@/lib/admin/format";
import { formatCompact } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, articles, comments, messages] = await Promise.all([
    getDashboardStats(),
    /* Panel yalnız son 5 məqaləni göstərir — hamısını çəkməyə ehtiyac yoxdur */
    listArticles({ pageSize: 5 }),
    listComments(),
    listMessages(),
  ]);

  const recentArticles = articles.items;
  const pendingComments = comments.filter((c) => c.status === "pending");
  const newMessages = messages.filter((m) => m.status === "new");

  const needsAttention = pendingComments.length + newMessages.length;

  return (
    <>
      {/* Salamlama */}
      <div className="mb-space-lg">
        <h1 className="font-headline text-headline-lg text-on-surface">
          Xoş gəlmisiniz
        </h1>
        <p className="font-body text-body-md text-on-surface-variant">
          {needsAttention > 0
            ? `${needsAttention} iş diqqətinizi gözləyir.`
            : "Hər şey qaydasındadır — gözləyən iş yoxdur."}
        </p>
      </div>

      {/* Nə etmək istəyirsiniz? */}
      <section className="mb-space-lg">
        <h2 className="font-label text-label-md uppercase tracking-wider text-outline mb-space-sm">
          Nə etmək istəyirsiniz?
        </h2>
        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-3">
          <ActionCard
            href="/admin/meqaleler/yeni"
            title="Yeni məqalə yaz"
            description="Başlıq, mətn və şəkil əlavə edib dərc edin"
            icon="post_add"
            primary
          />
          <ActionCard
            href="/admin/serhler"
            title="Oxucu şərhlərinə bax"
            description={
              pendingComments.length > 0
                ? "Təsdiq gözləyən şərhlər var"
                : "Bütün şərhlər nəzərdən keçirilib"
            }
            icon="forum"
            count={pendingComments.length}
          />
          <ActionCard
            href="/admin/muracietler"
            title="Müraciətlərə cavab ver"
            description={
              newMessages.length > 0
                ? "Yeni məktublar gəlib"
                : "Yeni müraciət yoxdur"
            }
            icon="inbox"
            count={newMessages.length}
          />
          <ActionCard
            href="/admin/meqaleler"
            title="Məqalələri idarə et"
            description="Redaktə edin, gizlədin və ya silin"
            icon="article"
          />
          <ActionCard
            href="/admin/hekim"
            title="Öz məlumatlarımı yenilə"
            description="Bioqrafiya, təhsil, sosial şəbəkələr"
            icon="badge"
          />
        </div>
      </section>

      <HelpNote title="İdarə paneli nə üçündür?" className="mb-space-lg">
        <p>
          Bu panel saytınızın məzmununu idarə etmək üçündür. Soldakı menyudan
          istədiyiniz bölməni açırsınız:
        </p>
        <ul>
          <li>
            <strong>Yazılarım</strong> — məqalələr, videolar və sənədlər.
          </li>
          <li>
            <strong>Oxucular</strong> — şərhlər, sizə gələn məktublar və bülleten
            abunəçiləri.
          </li>
          <li>
            <strong>Sayt məlumatları</strong> — öz profiliniz, əlaqə məlumatları
            və ümumi tənzimləmələr.
          </li>
        </ul>
        <p className="mt-space-2xs">
          Etdiyiniz hər dəyişiklik dərhal sayta düşür. Əmin deyilsinizsə,
          məqaləni «Qaralama» olaraq saxlayın — belə halda saytda görünmür.
        </p>
      </HelpNote>

      {/* Rəqəmlər */}
      <section className="mb-space-lg">
        <h2 className="font-label text-label-md uppercase tracking-wider text-outline mb-space-sm">
          Saytın vəziyyəti
        </h2>
        <div className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Saytda olan məqalə"
            value={stats.published}
            icon="article"
            href="/admin/meqaleler"
            hint={
              stats.drafts > 0
                ? `${stats.drafts} qaralama hələ dərc olunmayıb`
                : "Qaralama yoxdur"
            }
          />
          <StatCard
            label="Ümumi oxunma"
            value={formatCompact(stats.totalViews)}
            icon="visibility"
            hint="Bütün məqalələr üzrə"
          />
          <StatCard
            label="Bülleten abunəçisi"
            value={stats.subscribers}
            icon="mail"
            href="/admin/abuneciler"
            hint="Yeniliklərinizi poçtla alır"
          />
          <StatCard
            label="Cavablanmamış"
            value={needsAttention}
            icon="pending_actions"
            highlight={needsAttention > 0}
            hint="Şərh və müraciətlər"
          />
        </div>
      </section>

      <div className="grid gap-space-md xl:grid-cols-2">
        {/* Son məqalələr */}
        <AdminCard
          title="Son yazdıqlarınız"
          actionLabel="Hamısı"
          actionHref="/admin/meqaleler"
          flush
        >
          <ul className="divide-y divide-surface-container">
            {recentArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/admin/meqaleler/${article.id}`}
                  className="flex items-start gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low/60 transition-colors"
                >
                  <span className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="font-label text-label-lg text-on-surface line-clamp-2">
                      {article.title}
                    </span>
                    <span className="flex items-center gap-space-xs">
                      <StatusPill
                        label={articleStatusLabels[article.status]}
                        tone={article.status === "published" ? "success" : "neutral"}
                      />
                      <span className="font-label text-label-sm text-outline">
                        {article.publishedAtLabel}
                      </span>
                    </span>
                  </span>
                  <Icon
                    name="edit"
                    size={16}
                    className="shrink-0 mt-1 text-outline"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>

        {/* Gözləyən işlər */}
        <AdminCard title="Sizi gözləyən işlər" flush>
          {needsAttention === 0 ? (
            <div className="flex flex-col items-center gap-space-2xs py-space-2xl px-space-md text-center">
              <Icon name="check_circle" size={34} className="text-secondary" />
              <p className="font-headline text-headline-sm text-on-surface">
                Hər şey hazırdır
              </p>
              <p className="font-body text-body-sm text-on-surface-variant">
                Cavablanmamış şərh və ya müraciət yoxdur.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-container">
              {pendingComments.slice(0, 3).map((comment) => (
                <li key={comment.id}>
                  <Link
                    href="/admin/serhler"
                    className="flex items-start gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low/60 transition-colors"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-tertiary-fixed/50 flex items-center justify-center text-on-tertiary-fixed-variant">
                      <Icon name="forum" size={16} />
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-label text-label-lg text-on-surface">
                        {comment.authorName} şərh yazıb
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant line-clamp-1">
                        {comment.body}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              {newMessages.slice(0, 3).map((message) => (
                <li key={message.id}>
                  <Link
                    href="/admin/muracietler"
                    className="flex items-start gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low/60 transition-colors"
                  >
                    <span className="w-8 h-8 shrink-0 rounded-full bg-secondary/12 flex items-center justify-center text-secondary">
                      <Icon name="mail" size={16} />
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-label text-label-lg text-on-surface line-clamp-1">
                        {message.subject}
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {message.fullName} • {message.receivedAtLabel}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}
