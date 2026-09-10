"use client";

import { useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ConfirmButtonProps {
  onConfirm: () => Promise<unknown>;
  /** Silinən qeydin adı — dialoqda göstərilir */
  itemName?: string;
  label?: string;
  icon?: string;
  title?: string;
  /** Dialoqdakı əsas sual */
  question?: string;
  className?: string;
}

/**
 * Silmə düyməsi — açıq dialoq ilə.
 * Nəyin silindiyi adı ilə göstərilir və nəticənin geri qaytarılmadığı yazılır.
 */
export function ConfirmButton({
  onConfirm,
  itemName,
  label,
  icon = "delete",
  title = "Sil",
  question,
  className,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={title}
        className={cn(
          "inline-flex items-center gap-1 h-8 px-2 rounded-md font-label text-label-sm text-error hover:bg-error-container/50 transition-colors",
          className,
        )}
      >
        <Icon name={icon} size={16} />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-space-md">
          <button
            type="button"
            aria-label="Bağla"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-inverse-surface/45 backdrop-blur-sm"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-2 p-space-lg flex flex-col gap-space-md"
          >
            <span className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <Icon name="delete_forever" size={24} />
            </span>

            <div className="flex flex-col gap-space-2xs">
              <h2 className="font-headline text-headline-sm text-on-surface">
                {question ?? "Silmək istədiyinizə əminsiniz?"}
              </h2>
              {itemName && (
                <p className="font-body text-body-md text-on-surface rounded-md bg-surface-container-low px-space-sm py-space-xs">
                  «{itemName}»
                </p>
              )}
              <p className="font-body text-body-sm text-on-surface-variant">
                Bu qeyd birdəfəlik silinəcək və geri qaytarmaq mümkün olmayacaq.
              </p>
            </div>

            <div className="flex items-center justify-end gap-space-xs">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Xeyr, ləğv et
              </Button>
              <Button
                icon="delete"
                disabled={pending}
                className="bg-error border-error/40 hover:bg-error/90"
                onClick={() =>
                  startTransition(async () => {
                    await onConfirm();
                    setOpen(false);
                  })
                }
              >
                {pending ? "Silinir..." : "Bəli, sil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
