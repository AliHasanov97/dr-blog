import { AdminPageHeader, HelpNote, ResourceManager } from "@/components/admin";
import { listProtocols } from "@/lib/admin/queries";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";

export const metadata = { title: "Protokollar" };

export default async function AdminProtocolsPage() {
  const protocols = await listProtocols();
  const rows = protocols.map((p: any) => ({ ...p }));

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
          Hazırda faylın ünvanını əl ilə yazmaq lazımdır. Fayl yükləmə imkanı
          backend hazır olandan sonra əlavə olunacaq — o vaxta qədər sənədi
          ayrıca yerə yükləyib linkini bura yazın.
        </p>
      </HelpNote>
      <ResourceManager
        scope={{ kind: "protocol" }}
        items={rows}
        actions={{ create, update, remove }}
        searchFields={["title", "description"]}
        fields={[
          { name: "title", label: "Sənədin adı", type: "text", required: true, colSpan: 2 },
          { name: "description", label: "Təsvir", type: "textarea", rows: 3, colSpan: 2 },
          {
            name: "fileUrl",
            label: "Faylın ünvanı",
            type: "text",
            placeholder: "/files/esc-2024.pdf",
          },
          {
            name: "fileSizeLabel",
            label: "Fayl ölçüsü",
            type: "text",
            hint: "Oxucuya məlumat üçün göstərilir",
            placeholder: "2.4 MB",
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
