"use client";

import { useMemo, useState, useTransition } from "react";
import { ConfirmButton } from "@/components/admin";
import { Button, Icon } from "@/components/ui";
import type { ContactMessage, MessageStatus } from "@/lib/mock/store";
import { deleteMessage, setMessageStatus } from "./actions";
import { cn } from "@/lib/utils";

export interface MessageInboxClientProps {
  messages: ContactMessage[];
}

const statusConfig: Record<MessageStatus, { label: string; color: string; bg: string }> = {
  new: { label: "Yeni", color: "text-amber-700", bg: "bg-amber-50" },
  read: { label: "Oxunub", color: "text-sky-700", bg: "bg-sky-50" },
  answered: { label: "Cavablanıb", color: "text-emerald-700", bg: "bg-emerald-50" },
  archived: { label: "Arxiv", color: "text-slate-500", bg: "bg-slate-50" },
};

export function MessageInboxClient({ messages }: MessageInboxClientProps) {
  const [filter, setFilter] = useState<MessageStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => ({
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    read: messages.filter((m) => m.status === "read").length,
    answered: messages.filter((m) => m.status === "answered").length,
    archived: messages.filter((m) => m.status === "archived").length,
  }), [messages]);

  const visible = useMemo(
    () => filter === "all" ? messages : messages.filter((m) => m.status === filter),
    [messages, filter],
  );

  function updateStatus(id: string, status: MessageStatus) {
    startTransition(() => void setMessageStatus(id, status));
  }

  function toggleExpand(message: ContactMessage) {
    if (expandedId === message.id) {
      setExpandedId(null);
    } else {
      setExpandedId(message.id);
      if (message.status === "new") updateStatus(message.id, "read");
    }
  }

  return (
    <div className="space-y-4">
      {/* Sadə filtrlər */}
      <div className="flex gap-2 text-sm">
        {[
          { key: "all", label: "Hamısı" },
          { key: "new", label: "Yeni" },
          { key: "answered", label: "Cavablanıb" },
          { key: "archived", label: "Arxiv" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as MessageStatus | "all")}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors",
              filter === f.key
                ? "bg-secondary text-on-secondary"
                : "text-outline hover:bg-surface-container",
            )}
          >
            {f.label}
            {counts[f.key as keyof typeof counts] > 0 && (
              <span className="ml-1.5 opacity-70">
                {counts[f.key as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mesaj siyahısı */}
      {visible.length === 0 ? (
        <div className="py-16 text-center text-outline">
          <Icon name="inbox" size={32} className="mx-auto mb-2 opacity-50" />
          <p>Mesaj yoxdur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const status = statusConfig[msg.status];
            const isNew = msg.status === "new";

            return (
              <div
                key={msg.id}
                className={cn(
                  "rounded-xl border bg-surface-container-lowest transition-shadow",
                  isExpanded ? "shadow-md border-secondary/30" : "border-surface-container",
                )}
              >
                {/* Header - klikləmə ilə açılır */}
                <button
                  type="button"
                  onClick={() => toggleExpand(msg)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      isNew ? "bg-secondary text-on-secondary" : "bg-surface-container text-outline",
                    )}>
                      {msg.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>

                    {/* Məzmun */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "font-medium truncate",
                          isNew ? "text-on-surface" : "text-on-surface-variant",
                        )}>
                          {msg.fullName}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          status.bg, status.color,
                        )}>
                          {status.label}
                        </span>
                      </div>

                      <p className={cn(
                        "text-sm truncate",
                        isNew ? "text-on-surface font-medium" : "text-on-surface-variant",
                      )}>
                        {msg.subject}
                      </p>

                      {!isExpanded && (
                        <p className="text-sm text-outline truncate mt-0.5">
                          {msg.message}
                        </p>
                      )}
                    </div>

                    {/* Tarix və expand ikonu */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-outline">
                        {msg.receivedAtLabel.split("•")[0].trim()}
                      </p>
                      <Icon
                        name={isExpanded ? "expand_less" : "expand_more"}
                        size={20}
                        className="text-outline mt-1"
                      />
                    </div>
                  </div>
                </button>

                {/* Genişlənmiş məzmun */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-surface-container">
                    {/* Əlaqə məlumatları */}
                    <div className="flex flex-wrap gap-4 py-3 text-sm text-outline">
                      <span className="flex items-center gap-1">
                        <Icon name="mail" size={16} />
                        {msg.contact}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="category" size={16} />
                        {msg.inquiryTypeLabel}
                      </span>
                    </div>

                    {/* Mesaj mətni */}
                    <div className="p-4 rounded-lg bg-surface-container/50 text-on-surface leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </div>

                    {/* Əməliyyatlar */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        size="sm"
                        icon="reply"
                        onClick={() => {
                          const url = msg.contact.includes("@")
                            ? `mailto:${msg.contact}?subject=${encodeURIComponent("Re: " + msg.subject)}`
                            : `tel:${msg.contact.replace(/\s/g, "")}`;
                          window.open(url, "_blank");
                          updateStatus(msg.id, "answered");
                        }}
                      >
                        Cavab yaz
                      </Button>

                      {msg.status !== "answered" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="check"
                          disabled={pending}
                          onClick={() => updateStatus(msg.id, "answered")}
                        >
                          Cavablandım
                        </Button>
                      )}

                      {msg.status !== "archived" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="archive"
                          disabled={pending}
                          onClick={() => updateStatus(msg.id, "archived")}
                        >
                          Arxivlə
                        </Button>
                      )}

                      <div className="flex-1" />

                      <ConfirmButton
                        onConfirm={async () => {
                          await deleteMessage(msg.id);
                          if (expandedId === msg.id) setExpandedId(null);
                        }}
                        label="Sil"
                        itemName={msg.subject}
                        question="Bu mesajı silmək istəyirsiniz?"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
