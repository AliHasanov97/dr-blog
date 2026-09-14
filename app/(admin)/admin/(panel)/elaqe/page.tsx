import { AdminPageHeader, ResourceManager } from "@/components/admin";
import {
  getTranslatableLocales,
  isMultiLanguageEnabled,
  LOCALE_LABELS,
  translatableFieldName,
} from "@/i18n/routing";
import { getContactInfo, getDoctorProfile, listFaq } from "@/lib/admin/queries";
import type { ResourceRow } from "@/lib/admin/types";
import {
  createResource,
  deleteResource,
  updateResource,
} from "../_resources/actions";
import { ContactSettingsForm } from "./ContactSettingsForm";

export const metadata = { title: "Əlaqə & FAQ" };

export default async function AdminContactPage() {
  const [contactInfo, doctor, faqItems] = await Promise.all([
    getContactInfo(),
    getDoctorProfile(),
    listFaq(),
  ]);
  const multiLanguageEnabled = isMultiLanguageEnabled();
  const locales = getTranslatableLocales();

  async function create(values: Record<string, string>) {
    "use server";
    return createResource("faq", values);
  }
  async function update(id: string, values: Record<string, string>) {
    "use server";
    return updateResource("faq", id, values);
  }
  async function remove(id: string) {
    "use server";
    return deleteResource("faq", id);
  }

  return (
    <>
      <AdminPageHeader
        title="Əlaqə məlumatları"
        icon="contact_support"
      />

      <div className="flex flex-col gap-space-lg">
        <ContactSettingsForm
          channels={contactInfo.channels as any}
          office={contactInfo.locations[0] as any}
          socialLinks={(doctor?.socialLinks ?? []) as any}
        />

        {/* FAQ Section */}
        <div className="rounded-xl border border-surface-container bg-surface-container-lowest overflow-hidden">
          <div className="px-space-md py-space-sm border-b border-surface-container">
            <h2 className="font-headline text-title-md text-on-surface">Tez-tez verilən suallar</h2>
            <p className="text-sm text-outline">Əlaqə səhifəsindəki FAQ bölməsi</p>
          </div>
          <div className="p-space-md">
            <ResourceManager
              items={faqItems.map((f: any) => {
                const row: ResourceRow = {
                  id: f.id,
                  question: f.question,
                  answer: f.answer,
                };
                const filled: string[] = [];
                for (const locale of locales) {
                  const question = f.translations?.[locale]?.question ?? "";
                  const answer = f.translations?.[locale]?.answer ?? "";
                  row[translatableFieldName("question", locale)] = question;
                  row[translatableFieldName("answer", locale)] = answer;
                  if (question || answer) filled.push(LOCALE_LABELS[locale] ?? locale);
                }
                row.translationStatus =
                  multiLanguageEnabled && filled.length > 0
                    ? `${filled.join(", ")} var`
                    : "Tərcümə yoxdur";
                return row;
              })}
              actions={{ create, update, remove }}
              searchFields={["question", "answer"]}
              fields={[
                {
                  name: "question",
                  label: multiLanguageEnabled ? `Sual (${LOCALE_LABELS.az})` : "Sual",
                  type: "text",
                  required: true,
                  placeholder: "Həkimə necə müraciət edə bilərəm?",
                  colSpan: 2,
                },
                {
                  name: "answer",
                  label: multiLanguageEnabled ? `Cavab (${LOCALE_LABELS.az})` : "Cavab",
                  type: "textarea",
                  rows: 4,
                  required: true,
                  colSpan: 2,
                },
                ...locales.flatMap((locale) => [
                  {
                    name: translatableFieldName("question", locale),
                    label: `Sual (${LOCALE_LABELS[locale] ?? locale})`,
                    type: "text" as const,
                    hint: `Boş qalsa ${LOCALE_LABELS[locale] ?? locale} saytda ${LOCALE_LABELS.az} sual göstərilir`,
                    colSpan: 2 as const,
                  },
                  {
                    name: translatableFieldName("answer", locale),
                    label: `Cavab (${LOCALE_LABELS[locale] ?? locale})`,
                    type: "textarea" as const,
                    rows: 4,
                    hint: `Boş qalsa ${LOCALE_LABELS[locale] ?? locale} saytda ${LOCALE_LABELS.az} cavab göstərilir`,
                    colSpan: 2 as const,
                  },
                ]),
              ]}
              nameField="question"
              labels={{
                addButton: "Yeni sual",
                createTitle: "Yeni sual-cavab",
                editTitle: "Sualı dəyiş",
                empty: "Hələ sual əlavə olunmayıb.",
                searchPlaceholder: "Sual axtar...",
              }}
              columns={[
                {
                  key: "question",
                  header: "Sual",
                  type: "primary",
                  titleField: "question",
                  subtitleField: "answer",
                  icon: "help",
                },
                ...(multiLanguageEnabled
                  ? [
                      {
                        key: "translationStatus",
                        header: "Tərcümələr",
                        type: "badge" as const,
                        field: "translationStatus",
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
