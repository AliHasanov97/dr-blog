import Link from "next/link";
import { Icon } from "@/components/ui";
import { Container } from "./Container";
import { navItems, siteConfig } from "@/lib/site";
import { mockDoctor } from "@/lib/mock/doctor";

/** Desktop altlıq — mobil alt naviqasiya ilə toqquşmasın deyə yalnız lg-də görünür */
export function SiteFooter() {
  return (
    <footer className="hidden lg:block mt-space-3xl border-t border-surface-container bg-surface-container-low/60">
      <Container className="py-space-2xl grid grid-cols-12 gap-space-xl">
        <div className="col-span-5 flex flex-col gap-space-xs">
          <span className="font-headline text-headline-md text-on-surface">
            {siteConfig.name}
          </span>
          <span className="font-label text-label-md uppercase tracking-wider text-secondary">
            {siteConfig.title}
          </span>
          <p className="font-body text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        <nav className="col-span-3 flex flex-col gap-space-xs" aria-label="Altlıq naviqasiyası">
          <span className="font-label text-label-md uppercase tracking-wider text-outline">
            Səhifələr
          </span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="col-span-4 flex flex-col gap-space-xs">
          <span className="font-label text-label-md uppercase tracking-wider text-outline">
            Kanallar
          </span>
          <div className="flex flex-wrap gap-space-xs">
            {mockDoctor.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-container-lowest border border-surface-container text-on-surface-variant hover:text-secondary hover:border-secondary/40 transition-colors"
              >
                <Icon name={link.icon} size={18} />
              </a>
            ))}
          </div>
          <p className="mt-space-xs font-label text-label-sm text-outline leading-relaxed">
            Bu sayt məlumatlandırma məqsədi daşıyır və həkim məsləhətini əvəz etmir.
            Təcili hallarda {siteConfig.emergencyNumber} xidmətinə müraciət edin.
          </p>
        </div>
      </Container>

      <Container className="py-space-md border-t border-surface-container flex items-center justify-between">
        <span className="font-label text-label-sm text-outline">
          © {new Date().getFullYear()} {siteConfig.name}. Bütün hüquqlar qorunur.
        </span>
        <span className="font-label text-label-sm text-outline">
          Bakı, Azərbaycan
        </span>
      </Container>
    </footer>
  );
}
