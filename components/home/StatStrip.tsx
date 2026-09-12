import { Container } from "@/components/layout";
import type { DoctorStat } from "@/lib/types";

export interface StatStripProps {
  stats: DoctorStat[];
}

/** Hero-nun altındakı nazik statistika lenti */
export function StatStrip({ stats }: StatStripProps) {
  return (
    <section className="border-b border-surface-container bg-surface-container-low/60">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-container">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-0.5 py-space-md lg:py-space-lg text-center"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-headline text-headline-md lg:text-headline-lg text-primary leading-none">
                {stat.value}
              </dd>
              <span className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">
                {stat.label}
              </span>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
