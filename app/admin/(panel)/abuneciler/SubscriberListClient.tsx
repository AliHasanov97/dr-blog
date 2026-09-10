"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ConfirmButton,
  DataCell,
  DataRow,
  DataTable,
  StatusPill,
} from "@/components/admin";
import { Button, Icon, SearchBar } from "@/components/ui";
import type { Subscriber } from "@/lib/mock/store";
import { deleteSubscriber, toggleSubscriber } from "./actions";

export interface SubscriberListClientProps {
  subscribers: Subscriber[];
}

export function SubscriberListClient({ subscribers }: SubscriberListClientProps) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.toLocaleLowerCase("az").trim();
    return q ? subscribers.filter((s) => s.email.includes(q)) : subscribers;
  }, [subscribers, query]);

  async function copyActive() {
    const list = subscribers
      .filter((s) => s.isActive)
      .map((s) => s.email)
      .join(", ");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-80">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="E-poçt axtar..."
          />
        </div>
        <Button
          variant="secondary"
          icon={copied ? "check" : "content_copy"}
          onClick={copyActive}
          className="shrink-0"
        >
          {copied ? "Kopyalandı" : "Aktiv e-poçtları kopyala"}
        </Button>
      </div>

      <div className="rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-1 overflow-hidden">
        <DataTable
          headers={[
            { key: "email", label: "E-poçt" },
            { key: "date", label: "Abunə tarixi" },
            { key: "status", label: "Status" },
            { key: "actions", label: "", className: "text-end" },
          ]}
          isEmpty={visible.length === 0}
          emptyLabel="Abunəçi tapılmadı."
        >
          {visible.map((sub) => (
            <DataRow key={sub.id}>
              <DataCell>
                <span className="inline-flex items-center gap-space-xs">
                  <Icon name="mail" size={16} className="text-outline" />
                  <span className="font-body text-body-md text-on-surface">
                    {sub.email}
                  </span>
                </span>
              </DataCell>
              <DataCell>
                <span className="font-label text-label-sm text-outline whitespace-nowrap">
                  {sub.subscribedAtLabel}
                </span>
              </DataCell>
              <DataCell>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => {
                      void toggleSubscriber(sub.id);
                    })
                  }
                  title="Statusu dəyiş"
                  className="disabled:opacity-50"
                >
                  <StatusPill
                    label={sub.isActive ? "Aktiv" : "Dayandırılıb"}
                    tone={sub.isActive ? "success" : "neutral"}
                  />
                </button>
              </DataCell>
              <DataCell className="text-end">
                <ConfirmButton onConfirm={() => deleteSubscriber(sub.id)} />
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
