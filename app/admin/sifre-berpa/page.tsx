import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Şifrəni bərpa et",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-margin-mobile py-space-2xl bg-surface">
      <div className="w-full max-w-md flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <span className="w-11 h-11 rounded-md bg-primary-container flex items-center justify-center text-secondary-fixed">
            <Icon name="lock_reset" size={22} />
          </span>
          <h1 className="font-headline text-headline-lg text-on-surface mt-space-xs">
            Şifrəni bərpa et
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Hesabınıza bağlı e-poçt ünvanını yazın — bərpa linki oraya
            göndəriləcək.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
