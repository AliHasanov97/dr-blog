"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Saytda ən çox lazım olan ikonlar — həkim ad yazmır, şəkilə baxıb seçir */
const iconCatalog: { name: string; label: string }[] = [
  { name: "monitor_heart", label: "Ürək monitoru" },
  { name: "cardiology", label: "Kardiologiya" },
  { name: "favorite", label: "Ürək" },
  { name: "ecg_heart", label: "EKQ" },
  { name: "bloodtype", label: "Qan" },
  { name: "vital_signs", label: "Həyati göstəricilər" },
  { name: "stethoscope", label: "Stetoskop" },
  { name: "medication", label: "Dərman" },
  { name: "vaccines", label: "Peyvənd" },
  { name: "science", label: "Elm" },
  { name: "biotech", label: "Biotexnologiya" },
  { name: "microbiology", label: "Mikrobiologiya" },
  { name: "labs", label: "Laboratoriya" },
  { name: "speed", label: "Təzyiq / sürət" },
  { name: "directions_run", label: "İdman" },
  { name: "restaurant", label: "Qidalanma" },
  { name: "nutrition", label: "Pəhriz" },
  { name: "bedtime", label: "Yuxu" },
  { name: "self_improvement", label: "Sakitlik" },
  { name: "psychology", label: "Psixologiya" },
  { name: "lightbulb", label: "Tövsiyə" },
  { name: "fitness_center", label: "Məşq" },
  { name: "menu_book", label: "Kitab" },
  { name: "school", label: "Təhsil" },
  { name: "history_edu", label: "Elmi yazı" },
  { name: "workspace_premium", label: "Mükafat" },
  { name: "verified", label: "Təsdiq" },
  { name: "shield", label: "Qoruma" },
  { name: "emergency", label: "Təcili" },
  { name: "e911_emergency", label: "Xəbərdarlıq" },
  { name: "warning", label: "Diqqət" },
  { name: "info", label: "Məlumat" },
  { name: "smart_display", label: "Video" },
  { name: "photo_camera", label: "Instagram" },
  { name: "send", label: "Telegram" },
  { name: "chat", label: "WhatsApp" },
  { name: "work", label: "LinkedIn" },
  { name: "public", label: "Vebsayt" },
  { name: "alternate_email", label: "E-poçt" },
  { name: "call", label: "Telefon" },
  { name: "domain", label: "Klinika" },
  { name: "sell", label: "Etiket" },
  { name: "picture_as_pdf", label: "PDF" },
  { name: "dictionary", label: "Lüğət" },
];

export interface IconPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  className?: string;
}

/** İkon seçici — mətn sahəsi əvəzinə vizual şəbəkə */
export function IconPicker({
  label,
  value,
  onChange,
  hint,
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.toLocaleLowerCase("az").trim();
    if (!q) return iconCatalog;
    return iconCatalog.filter(
      (i) =>
        i.label.toLocaleLowerCase("az").includes(q) || i.name.includes(q),
    );
  }, [query]);

  const current = iconCatalog.find((i) => i.name === value);

  return (
    <div className={cn("flex flex-col gap-space-2xs", className)}>
      <span className="font-label text-label-md text-on-surface-variant">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-space-sm h-11 px-space-sm rounded-md border border-outline-variant bg-surface-container-lowest hover:border-secondary/40 transition-colors text-start"
      >
        <span className="w-8 h-8 rounded-md bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
          <Icon name={value || "help"} size={18} />
        </span>
        <span className="font-body text-body-md text-on-surface truncate">
          {current?.label ?? "Seçilməyib"}
        </span>
        <Icon name="expand_more" size={18} className="ms-auto text-outline" />
      </button>

      {hint && (
        <span className="font-label text-label-sm text-outline">{hint}</span>
      )}

      {open && (
        <div className="rounded-lg border border-surface-container bg-surface-container-lowest p-space-sm shadow-level-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İkon axtar: ürək, dərman, video..."
            className="w-full h-9 px-space-sm mb-space-sm rounded-md border border-outline-variant bg-surface-container-low font-body text-body-sm outline-none focus:border-secondary"
          />
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-52 overflow-y-auto">
            {visible.map((item) => (
              <button
                key={item.name}
                type="button"
                title={item.label}
                onClick={() => {
                  onChange(item.name);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center transition-colors",
                  value === item.name
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-secondary/12 hover:text-secondary",
                )}
              >
                <Icon name={item.name} size={20} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
