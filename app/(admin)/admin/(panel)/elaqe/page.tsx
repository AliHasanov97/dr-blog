import { AdminPageHeader, ResourceManager } from "@/components/admin";
import { getContactInfo, getDoctorProfile, listFaq } from "@/lib/admin/queries";
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
              items={faqItems.map((f: any) => ({
                ...f,
                ruStatus: f.questionRu || f.answerRu ? "RU var" : "RU yoxdur",
              }))}
              actions={{ create, update, remove }}
              searchFields={["question", "answer"]}
              fields={[
                {
                  name: "question",
                  label: "Sual (Azərbaycan dili)",
                  type: "text",
                  required: true,
                  placeholder: "Həkimə necə müraciət edə bilərəm?",
                  colSpan: 2,
                },
                {
                  name: "answer",
                  label: "Cavab (Azərbaycan dili)",
                  type: "textarea",
                  rows: 4,
                  required: true,
                  colSpan: 2,
                },
                {
                  name: "questionRu",
                  label: "Sual (Rus dili)",
                  type: "text",
                  hint: "Boş qalsa RU saytda Azərbaycanca sual göstərilir",
                  colSpan: 2,
                },
                {
                  name: "answerRu",
                  label: "Cavab (Rus dili)",
                  type: "textarea",
                  rows: 4,
                  hint: "Boş qalsa RU saytda Azərbaycanca cavab göstərilir",
                  colSpan: 2,
                },
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
                { key: "ruStatus", header: "Rus dili", type: "badge", field: "ruStatus" },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
