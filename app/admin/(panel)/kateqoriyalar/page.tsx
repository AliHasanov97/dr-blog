import { AdminPageHeader, HelpNote, ResourceManager } from "@/components/admin";
import { listCategories } from "@/lib/admin/queries";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";

export const metadata = { title: "Kateqoriyalar" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? "sell",
    count: c.articleCount,
  }));

  async function create(values: Record<string, string>) {
    "use server";
    return createResource("categories", values);
  }
  async function update(id: string, values: Record<string, string>) {
    "use server";
    return updateResource("categories", id, values);
  }
  async function remove(id: string) {
    "use server";
    return deleteResource("categories", id);
  }

  return (
    <>
      <AdminPageHeader
        title="Mövzular"
        description="Məqalələrin qruplaşdığı bölmələr"
        icon="sell"
      />
      <HelpNote title="Mövzu nədir?" className="mb-space-md">
        <p>
          Hər məqalə bir mövzuya aiddir (məsələn «Kardiologiya»). Oxucular bloq
          səhifəsində bu mövzulara görə süzgəcdən keçirir. Yeni mövzu yaratdıqda
          məqalə yazarkən onu seçə biləcəksiniz.
        </p>
      </HelpNote>
      <ResourceManager
        items={rows}
        actions={{ create, update, remove }}
        searchFields={["name", "slug"]}
        fields={[
          {
            name: "name",
            label: "Mövzunun adı",
            type: "text",
            required: true,
            placeholder: "Kardiologiya",
            colSpan: 2,
          },
          {
            name: "icon",
            label: "İkon",
            type: "icon",
            hint: "Siyahıda mövzunun yanında görünür",
            colSpan: 2,
          },
        ]}
        columns={[
          {
            key: "name",
            header: "Ad",
            type: "primary",
            titleField: "name",
            iconField: "icon",
          },
          { key: "count", header: "Neçə məqalə", type: "badge", field: "count" },
        ]}
        nameField="name"
        labels={{
          addButton: "Yeni mövzu",
          createTitle: "Yeni mövzu",
          editTitle: "Mövzunu dəyiş",
          empty: "Hələ mövzu yoxdur.",
          searchPlaceholder: "Mövzu axtar...",
        }}
      />
    </>
  );
}
