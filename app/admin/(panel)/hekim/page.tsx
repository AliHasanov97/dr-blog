import { AdminPageHeader } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { getDoctorProfile } from "@/lib/admin/queries";
import { DoctorProfileForm } from "./DoctorProfileForm";

export const metadata = { title: "Həkim profili" };

export default async function AdminDoctorPage() {
  const doctor = await getDoctorProfile();

  return (
    <>
      <AdminPageHeader
        title="Mənim profilim"
        icon="badge"
        actions={
          <ButtonLink href="/haqqinda" variant="secondary" icon="open_in_new">
            Saytda bax
          </ButtonLink>
        }
      />
      <DoctorProfileForm doctor={doctor as any} />
    </>
  );
}
