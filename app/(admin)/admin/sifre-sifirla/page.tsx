import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Şifrəni sıfırla",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-margin-mobile py-space-2xl bg-surface">
      <div className="w-full max-w-md flex flex-col gap-space-lg">
        <div className="flex flex-col gap-space-2xs">
          <span className="w-11 h-11 rounded-md bg-primary-container flex items-center justify-center text-secondary-fixed">
            <Icon name="lock_reset" size={22} />
          </span>
          <h1 className="font-headline text-headline-lg text-on-surface mt-space-xs">
            Şifrəni sıfırla
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Hesabınız üçün yeni şifrə təyin edin.
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-space-md">
            <p className="flex items-center gap-1 rounded-md bg-error-container/60 px-space-sm py-space-xs font-label text-label-md text-on-error-container">
              <Icon name="error" size={15} />
              Link etibarsızdır. Zəhmət olmasa yenidən bərpa tələb edin.
            </p>
            <Link
              href="/admin/sifre-berpa"
              className="inline-flex items-center gap-1 font-label text-label-lg text-secondary hover:underline"
            >
              <Icon name="arrow_back" size={16} />
              Bərpa linki tələb et
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
