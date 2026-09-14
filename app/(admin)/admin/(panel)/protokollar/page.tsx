import {
  AdminPageHeader,
  HelpNote,
  LanguageFilteredResourceManager,
  SCOPE_KEY_PLACEHOLDER,
} from "@/components/admin";
import { getTranslatableLocales, LOCALE_LABELS, routing } from "@/i18n/routing";
import { listProtocols } from "@/lib/admin/queries";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";

export const metadata = { title: "Protokollar" };

export default async function AdminProtocolsPage() {
  const protocols = await listProtocols();
  const locales = [routing.defaultLocale, ...getTranslatableLocales()];
  const rows = protocols.map((p: any) => ({
    ...p,
    languageLabel: (p.language as string).toUpperCase(),
  }));

  async function create(values: Record<string, string>) {
    "use server";
    return createResource("protocols", values);
  }
  async function update(id: string, values: Record<string, string>) {
    "use server";
    return updateResource("protocols", id, values);
  }
  async function remove(id: string) {
    "use server";
    return deleteResource("protocols", id);
  }

  return (
    <>
      <AdminPageHeader
        title="PDF sənədlər"
        description="Həmkarlarınızın yükləyə biləcəyi klinik protokollar"
        icon="picture_as_pdf"
      />
      <HelpNote title="Fayl necə əlavə olunur?" className="mb-space-md">
        <p>
          «Kompüterdən fayl yüklə» düyməsindən PDF, DOC və ya XLS sənədini
          birbaşa yükləyin — ünvan və ölçü avtomatik təyin olunur.
        </p>
      </HelpNote>
      <LanguageFilteredResourceManager
        scope={{ kind: "protocol", protocolKey: SCOPE_KEY_PLACEHOLDER }}
        keyField="id"
        items={rows}
        actions={{ create, update, remove }}
        searchFields={["title", "description"]}
        fields={[
          { name: "title", label: "Sənədin adı", type: "text", required: true, colSpan: 2 },
          { name: "description", label: "Təsvir", type: "textarea", rows: 3, colSpan: 2 },
          {
            name: "fileUrl",
            label: "Sənəd",
            type: "file",
            sizeField: "fileSizeLabel",
            colSpan: 2,
          },
          {
            name: "access",
            label: "Oxucu bu sənədlə nə edə bilsin?",
            type: "select",
            hint: "Yalnız PDF üçün əhəmiyyətlidir",
            colSpan: 2,
            options: [
              { value: "download", label: "Yalnız endirmə" },
              { value: "read", label: "Yalnız oxumaq" },
              { value: "both", label: "Hər ikisi" },
            ],
          },
          {
            name: "language",
            label: "Dil",
            type: "select",
            options: locales.map((l) => ({ value: l, label: `${LOCALE_LABELS[l] ?? l} dili` })),
          },
        ]}
        columns={[
          {
            key: "title",
            header: "Sənəd",
            type: "primary",
            titleField: "title",
            subtitleField: "description",
            icon: "picture_as_pdf",
          },
          { key: "language", header: "Dil", type: "badge", field: "languageLabel" },
          { key: "size", header: "Ölçü", type: "text", field: "fileSizeLabel" },
        ]}
        nameField="title"
        labels={{
          addButton: "Yeni sənəd",
          createTitle: "Yeni PDF sənəd",
          editTitle: "Sənədi dəyiş",
          empty: "Hələ sənəd yoxdur.",
          searchPlaceholder: "Sənəd axtar...",
        }}
      />
    </>
  );
}
