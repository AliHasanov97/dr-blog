import { AdminPageHeader, HelpNote, ResourceManager } from "@/components/admin";
import {
  getTranslatableLocales,
  isMultiLanguageEnabled,
  LOCALE_LABELS,
  translatableFieldName,
} from "@/i18n/routing";
import { listCategories } from "@/lib/admin/queries";
import type { ResourceRow } from "@/lib/admin/types";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";

export const metadata = { title: "Kateqoriyalar" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  const multiLanguageEnabled = isMultiLanguageEnabled();
  const locales = getTranslatableLocales();

  const rows = categories.map((c) => {
    const row: ResourceRow = {
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? "sell",
      count: c.articleCount,
    };
    const labelParts: string[] = [];
    for (const locale of locales) {
      const value = c.translations?.[locale]?.name ?? "";
      row[translatableFieldName("name", locale)] = value;
      if (value) labelParts.push(`${LOCALE_LABELS[locale] ?? locale}: ${value}`);
    }
    row.nameTranslationsLabel = labelParts.join(" · ");
    return row;
  });

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
            label: multiLanguageEnabled
              ? `Mövzunun adı (${LOCALE_LABELS.az})`
              : "Mövzunun adı",
            type: "text",
            required: true,
            placeholder: "Kardiologiya",
            colSpan: 2,
          },
          ...locales.map((locale) => ({
            name: translatableFieldName("name", locale),
            label: `Mövzunun adı (${LOCALE_LABELS[locale] ?? locale})`,
            type: "text" as const,
            placeholder: "Кардиология",
            hint: `Boş qalsa ${LOCALE_LABELS[locale] ?? locale} saytda ${LOCALE_LABELS.az} ad göstərilir`,
            colSpan: 2 as const,
          })),
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
            subtitleField: "nameTranslationsLabel",
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
