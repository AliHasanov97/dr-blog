"use client";

import { CollapsiblePanel } from "@/components/ui";
import type { TableOfContentsItem } from "@/lib/types";

export interface ArticleTocProps {
  items: TableOfContentsItem[];
  /** Desktop yan sütunda həmişə açıq göstərilsin */
  alwaysOpen?: boolean;
}

export function ArticleToc({ items, alwaysOpen = false }: ArticleTocProps) {
  const list = (
    <ol className="flex flex-col gap-space-xs">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="flex gap-space-xs items-start group"
          >
            <span className="font-label text-label-sm font-bold text-tertiary-fixed-dim shrink-0 pt-0.5">
              {item.index}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant group-hover:text-secondary transition-colors leading-snug">
              {item.title}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );

  if (alwaysOpen) {
    return (
      <nav
        aria-label="Məqalənin məzmunu"
        className="rounded-xl border border-surface-container bg-surface-container-low p-space-md"
      >
        <span className="block font-label text-label-md uppercase tracking-wider text-outline mb-space-sm">
          Məzmun ({items.length} bölmə)
        </span>
        {list}
      </nav>
    );
  }

  return (
    <CollapsiblePanel
      title={`Məzmun (${items.length} bölmə)`}
      icon="list_alt"
      defaultOpen
    >
      {list}
    </CollapsiblePanel>
  );
}
