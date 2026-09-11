import { AdminPageHeader } from "@/components/admin";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Hesabım" };

export default function AccountPage() {
  return (
    <>
      <AdminPageHeader
        title="Hesabım"
        description="Giriş şifrənizi buradan dəyişə bilərsiniz"
        icon="account_circle"
      />
      <PasswordForm />
    </>
  );
}
