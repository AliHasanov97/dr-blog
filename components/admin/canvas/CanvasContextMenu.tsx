"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface CanvasContextMenuProps {
  editor: Editor;
  /** Menyunun açıldığı nöqtə (ekran koordinatı) */
  position: { x: number; y: number } | null;
  onClose: () => void;
  onInsert: (kind: string) => void;
}

interface MenuRow {
  icon: string;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
}

/**
 * Kətanda sağ klik menyusu.
 * Mətn seçilibsə formatlaşdırma, seçilməyibsə bölmə əlavə etmə üstdə olur —
 * yəni menyu həmişə hazırda lazım olanı birinci göstərir.
 */
export function CanvasContextMenu({
  editor,
  position,
  onClose,
  onInsert,
}: CanvasContextMenuProps) {
  const menu = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  /* Menyu ekrandan kənara çıxmasın */
  useEffect(() => {
    if (!position) return;
    const width = 232;
    const height = menu.current?.offsetHeight ?? 320;
    setPlacement({
      left: Math.min(position.x, window.innerWidth - width - 8),
      top: Math.min(position.y, window.innerHeight - height - 8),
    });
  }, [position]);

  useEffect(() => {
    if (!position) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointer(event: MouseEvent) {
      if (!menu.current?.contains(event.target as Node)) onClose();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [position, onClose]);

  if (!position) return null;

  const hasSelection = !editor.state.selection.empty;

  const formatRows: MenuRow[] = [
    {
      icon: "format_bold",
      label: "Qalın",
      shortcut: "Ctrl+B",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: "format_italic",
      label: "Maili",
      shortcut: "Ctrl+I",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: "ink_highlighter",
      label: "Sarı marker",
      active: editor.isActive("highlight"),
      onClick: () => editor.chain().focus().toggleHighlight().run(),
    },
    {
      icon: "format_clear",
      label: "Formatı təmizlə",
      onClick: () => editor.chain().focus().unsetAllMarks().run(),
    },
  ];

  const alignRows: MenuRow[] = [
    {
      icon: "format_align_left",
      label: "Sola",
      active: editor.isActive({ textAlign: "left" }),
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
    },
    {
      icon: "format_align_center",
      label: "Ortaya",
      active: editor.isActive({ textAlign: "center" }),
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
    },
    {
      icon: "format_align_right",
      label: "Sağa",
      active: editor.isActive({ textAlign: "right" }),
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
    },
    {
      icon: "format_align_justify",
      label: "Eninə yay",
      active: editor.isActive({ textAlign: "justify" }),
      onClick: () => editor.chain().focus().setTextAlign("justify").run(),
    },
  ];

  const insertRows: MenuRow[] = [
    { icon: "title", label: "Başlıq", onClick: () => onInsert("heading") },
    { icon: "format_quote", label: "Tövsiyə", onClick: () => onInsert("quote") },
    { icon: "format_list_bulleted", label: "Nöqtəli siyahı", onClick: () => onInsert("bulletList") },
    { icon: "format_list_numbered", label: "Nömrəli siyahı", onClick: () => onInsert("orderedList") },
    { icon: "table_chart", label: "Cədvəl", onClick: () => onInsert("table") },
    { icon: "horizontal_rule", label: "Üfüqi xətt", onClick: () => onInsert("horizontalRule") },
    { icon: "code", label: "Kod bloku", onClick: () => onInsert("codeBlock") },
    { icon: "image", label: "Şəkil", onClick: () => onInsert("image") },
    { icon: "gallery_thumbnail", label: "Slayd", onClick: () => onInsert("slider") },
    { icon: "smart_display", label: "Video", onClick: () => onInsert("video") },
    { icon: "attach_file", label: "Fayl (PDF)", onClick: () => onInsert("file") },
  ];

  const groups = hasSelection
    ? [
        { title: "Format", rows: formatRows },
        { title: "Düzləndirmə", rows: alignRows },
        { title: "Əlavə et", rows: insertRows },
      ]
    : [
        { title: "Əlavə et", rows: insertRows },
        { title: "Düzləndirmə", rows: alignRows },
      ];

  return (
    <div
      ref={menu}
      role="menu"
      style={{ left: placement.left, top: placement.top }}
      className="fixed z-50 w-58 max-h-[70vh] overflow-y-auto rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 p-1"
    >
      {groups.map((group, index) => (
        <div key={group.title}>
          {index > 0 && (
            <span className="block h-px bg-outline-variant/60 my-1" />
          )}
          <span className="block px-space-xs pt-1 pb-0.5 font-label text-label-sm uppercase tracking-wider text-outline">
            {group.title}
          </span>
          {group.rows.map((row) => (
            <button
              key={row.label}
              type="button"
              role="menuitem"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                row.onClick();
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-space-xs px-space-xs h-8 rounded font-label text-label-md text-start transition-colors",
                row.active
                  ? "bg-secondary/12 text-secondary"
                  : "text-on-surface hover:bg-surface-container",
              )}
            >
              <Icon name={row.icon} size={16} className="text-outline shrink-0" />
              <span className="flex-1 truncate">{row.label}</span>
              {row.shortcut && (
                <span className="font-label text-label-sm text-outline shrink-0">
                  {row.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
