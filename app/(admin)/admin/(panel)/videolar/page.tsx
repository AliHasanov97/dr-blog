import {
  AdminPageHeader,
  HelpNote,
  LanguageFilteredResourceManager,
} from "@/components/admin";
import { getTranslatableLocales, isMultiLanguageEnabled, LOCALE_LABELS, routing } from "@/i18n/routing";
import { listVideos } from "@/lib/admin/queries";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";

export const metadata = { title: "Videolar" };

export default async function AdminVideosPage() {
  const videos = await listVideos();
  const languageSupport = isMultiLanguageEnabled();
  const locales = [routing.defaultLocale, ...getTranslatableLocales()];
  /* Cədvəldə başlığın altında videonun növü göstərilir — dil dəstəyi
   * söndürülübsə mövcud qeydlər üçün belə göstərilmir (bax: i18n/routing.ts) */
  const rows = videos.map((v) => ({
    ...v,
    meta: languageSupport
      ? [v.kindLabel, v.language?.toUpperCase()].filter(Boolean).join(" · ")
      : v.kindLabel,
  }));

  async function create(values: Record<string, string>) {
    "use server";
    return createResource("videos", values);
  }
  async function update(id: string, values: Record<string, string>) {
    "use server";
    return updateResource("videos", id, values);
  }
  async function remove(id: string) {
    "use server";
    return deleteResource("videos", id);
  }

  return (
    <>
      <AdminPageHeader
        title="Videolar"
        description="Bloq səhifəsindəki CardioTalk bölməsi"
        icon="smart_display"
      />
      <HelpNote title="Video necə əlavə olunur?" className="mb-space-md">
        <p>
          YouTube-da videonu açın, brauzerin ünvan sətrindəki linki kopyalayın və
          «Video linki» sahəsinə yapışdırın. Örtük şəklini isə hazır şəkillərdən
          seçirsiniz.
        </p>
      </HelpNote>
      <LanguageFilteredResourceManager
        scope={{ kind: "video" }}
        items={rows}
        actions={{ create, update, remove }}
        searchFields={["title", "kindLabel"]}
        fields={[
          { name: "title", label: "Başlıq", type: "text", required: true, colSpan: 2 },
          { name: "description", label: "Təsvir", type: "textarea", rows: 3, colSpan: 2 },
          {
            name: "url",
            label: "Video linki",
            type: "text",
            hint: "YouTube-dan kopyaladığınız ünvan",
            placeholder: "https://youtube.com/watch?v=...",
            colSpan: 2,
          },
          {
            name: "kindLabel",
            label: "Növü",
            type: "select",
            options: [
              { value: "Klinik Vebinar", label: "Klinik Vebinar" },
              { value: "Pasiyent İzahı", label: "Pasiyent İzahı" },
              { value: "Konfrans Çıxışı", label: "Konfrans Çıxışı" },
              { value: "Qısa İzah", label: "Qısa İzah" },
            ],
          },
          {
            name: "language",
            label: "Dil",
            type: "select",
            options: locales.map((l) => ({ value: l, label: `${LOCALE_LABELS[l] ?? l} dili` })),
          },
          { name: "thumbnailUrl", label: "Örtük şəkli", type: "image", colSpan: 2 },
        ]}
        columns={[
          {
            key: "title",
            header: "Video",
            type: "thumb",
            imageField: "thumbnailUrl",
            titleField: "title",
            subtitleField: "meta",
          },
        ]}
        nameField="title"
        labels={{
          addButton: "Yeni video",
          createTitle: "Yeni video",
          editTitle: "Videonu dəyiş",
          empty: "Hələ video əlavə olunmayıb.",
          searchPlaceholder: "Video axtar...",
        }}
      />
    </>
  );
}
