import { AdminPageHeader } from "@/components/admin";
import { getSiteSettings } from "@/lib/admin/queries";
import { storageStatus } from "@/lib/admin/media";
import { Icon } from "@/components/ui";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Parametrlər" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const storage = storageStatus();

  return (
    <>
      <AdminPageHeader
        title="Tənzimləmələr"
        icon="settings"
      />
      <SettingsForm settings={settings} />

      {/* Faylların harada saxlandığı — yayımda ən çox səhv edilən yer */}
      <div
        className={
          storage.ready
            ? "mt-space-lg rounded-xl border border-secondary/30 bg-secondary/[0.06] p-space-md flex flex-col gap-space-2xs"
            : "mt-space-lg rounded-xl border border-tertiary-fixed-dim/50 bg-tertiary-fixed-dim/10 p-space-md flex flex-col gap-space-2xs"
        }
      >
        <span className="flex items-center gap-space-2xs font-label text-label-lg text-on-surface">
          <Icon
            name={storage.ready ? "cloud_done" : "warning"}
            size={18}
            className={storage.ready ? "text-secondary" : "text-on-tertiary-container"}
          />
          Fayl anbarı: {storage.label}
        </span>
        {storage.ready ? (
          <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
            Şəkillər və sənədlər Cloudflare R2-də saxlanılır — deploy zamanı
            itmir.{" "}
            {storage.direct ? (
              <>Oxuculara birbaşa Cloudflare şəbəkəsindən verilir.</>
            ) : (
              <>
                Publik ünvan (<code>R2_PUBLIC_URL</code>) hələ təyin
                edilmədiyinə görə fayllar serverin üzərindən ötürülür. İşləyir,
                amma bucket-ə özəl domen bağlasanız daha sürətli olacaq.
              </>
            )}
          </p>
        ) : (
          <p className="font-body text-body-sm text-on-tertiary-fixed-variant leading-relaxed">
            Fayl anbarı qoşulmayıb — şəkil və sənəd yükləmək mümkün deyil.
            Diskə yazma qəsdən söndürülüb: yayımda hər deploy-da fayllar
            silinərdi. <code>.env</code> faylında bu dəyərləri doldurun:{" "}
            {storage.missing.join(", ")}.
          </p>
        )}
      </div>
    </>
  );
}
