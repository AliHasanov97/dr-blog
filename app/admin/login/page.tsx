import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { LoginForm } from "./LoginForm";
import { demoAccounts } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "İdarə panelinə giriş",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Sol: brend paneli */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary-container text-on-primary p-space-2xl">
        <span
          aria-hidden="true"
          className="absolute -top-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-secondary/20 blur-[110px]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative flex items-center gap-space-xs">
          <span className="w-9 h-9 rounded-md bg-secondary/20 flex items-center justify-center text-secondary-fixed">
            <Icon name="monitor_heart" size={20} />
          </span>
          <span className="font-headline text-headline-sm text-on-primary">
            {siteConfig.name}
          </span>
        </div>

        <div className="relative flex flex-col gap-space-md max-w-md">
          <h1 className="font-display text-[40px] leading-[48px] tracking-tight text-on-primary">
            Kontent idarəetmə paneli
          </h1>
          <p className="font-body text-body-md text-on-primary-container leading-relaxed">
            Məqalələr, elmi icmallar, şərh moderasiyası, oxucu müraciətləri və
            həkim profili — hamısı bir yerdən idarə olunur.
          </p>
          <ul className="flex flex-col gap-space-xs pt-space-xs">
            {[
              "Blok əsaslı məqalə redaktoru",
              "Şərh moderasiyası və həkim cavabları",
              "Müraciətlər və bülleten abunəçiləri",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-space-xs font-body text-body-sm text-on-primary-container"
              >
                <Icon name="check_circle" size={16} className="text-secondary-fixed" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-label text-label-sm text-on-primary-container/70">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>

      {/* Sağ: forma */}
      <div className="flex flex-col justify-center px-margin-mobile py-space-2xl lg:px-space-3xl bg-surface">
        <div className="w-full max-w-md mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col gap-space-2xs">
            <span className="flex items-center gap-space-xs lg:hidden mb-space-sm">
              <span className="w-9 h-9 rounded-md bg-primary-container flex items-center justify-center text-secondary-fixed">
                <Icon name="monitor_heart" size={20} />
              </span>
              <span className="font-headline text-headline-sm text-on-surface">
                {siteConfig.name}
              </span>
            </span>
            <h2 className="font-headline text-headline-lg text-on-surface">
              Xoş gəlmisiniz
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Davam etmək üçün idarəçi hesabınızla daxil olun.
            </p>
          </div>

          <LoginForm next={next ?? "/admin"} demoAccounts={demoAccounts} />

          <Link
            href="/"
            className="inline-flex items-center gap-1 font-label text-label-lg text-on-surface-variant hover:text-secondary transition-colors"
          >
            <Icon name="arrow_back" size={16} />
            Sayta qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}
