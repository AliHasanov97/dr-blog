import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Icon } from "@/components/ui";
import {
  alignChoices,
  colorChoices,
  commonEmojis,
  fontChoices,
  insertChoices,
  lineHeightChoices,
  sizeChoices,
  specialChars,
  type InsertKey,
} from "./choices";
import { TButton, TDivider, TDropdown, TRow } from "./ToolbarControls";

/* --------------------------------------------------------------
 * Alət zolağı — həmişə eyni yerdə, «Word kimi»
 * ------------------------------------------------------------ */

export function Toolbar({
  editor,
  onInsert,
}: {
  editor: Editor;
  onInsert: (kind: InsertKey) => void;
}) {
  const [popover, setPopover] = useState<"link" | null>(null);
  const [draft, setDraft] = useState("");

  function apply() {
    const value = draft.trim();
    if (!value) return;
    if (popover === "link") {
      editor.chain().focus().setLink({ href: value }).run();
    }
    setDraft("");
    setPopover(null);
  }

  return (
    <div className="sticky top-[4.5rem] z-20 rounded-lg border border-surface-container bg-surface-container-low/95 backdrop-blur-lg shadow-lg p-1.5 flex flex-col gap-1">
      {/* Formatlaşdırma */}
      <div className="flex flex-wrap items-center gap-0.5">
        <TButton
          icon="format_bold"
          title="Qalın"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <TButton
          icon="format_italic"
          title="Maili"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <TButton
          icon="format_underlined"
          title="Altdan xətt"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <TButton
          icon="format_strikethrough"
          title="Üstdən xətt"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <TButton
          icon="ink_highlighter"
          title="Sarı marker"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />

        <TDivider />

        <TDropdown icon="palette" title="Mətnin rəngi">
          {colorChoices.map((choice) => (
            <TRow
              key={choice.label}
              onClick={() =>
                choice.hex
                  ? editor.chain().focus().setColor(choice.hex).run()
                  : editor.chain().focus().unsetColor().run()
              }
            >
              <span
                aria-hidden="true"
                className="w-4 h-4 rounded-full border border-outline-variant shrink-0"
                style={{ background: choice.swatch }}
              />
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        <TDropdown icon="format_size" title="Hərflərin ölçüsü">
          {sizeChoices.map((choice) => (
            <TRow
              key={choice.label}
              onClick={() =>
                choice.value
                  ? editor.chain().focus().setFontSize(choice.value).run()
                  : editor.chain().focus().unsetFontSize().run()
              }
            >
              <span
                className="w-6 text-center text-outline shrink-0"
                style={{ fontSize: choice.value || "inherit" }}
              >
                A
              </span>
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        <TDropdown icon="text_fields" title="Şrift növü">
          {fontChoices.map((choice) => (
            <TRow
              key={choice.label}
              onClick={() =>
                choice.value
                  ? editor.chain().focus().setFontFamily(choice.value).run()
                  : editor.chain().focus().unsetFontFamily().run()
              }
            >
              <span
                className="w-5 text-center shrink-0"
                style={{ fontFamily: choice.value || "inherit" }}
              >
                A
              </span>
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        <TDropdown icon="format_align_left" title="Mətni düzləndir">
          {alignChoices.map((choice) => (
            <TRow
              key={choice.value}
              onClick={() =>
                editor.chain().focus().setTextAlign(choice.value).run()
              }
            >
              <Icon
                name={choice.icon}
                size={16}
                className="text-outline shrink-0"
              />
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        <TDivider />

        <TButton
          icon="subscript"
          title="Alt yazi (H2O)"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />
        <TButton
          icon="superscript"
          title="Ust yazi (m2)"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />
        <TButton
          icon="code"
          title="Kod formatı"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />

        <TDivider />

        <TButton
          icon="link"
          title="Kecid elave et"
          active={editor.isActive("link")}
          onClick={() => setPopover((v) => (v === "link" ? null : "link"))}
        />

        <TDivider />

        <TDropdown icon="emoji_emotions" title="Emoji">
          <div className="grid grid-cols-5 gap-1 p-1">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => editor.chain().focus().insertContent(emoji).run()}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-container rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </TDropdown>

        <TDropdown icon="functions" title="Xususi simvollar">
          <div className="grid grid-cols-5 gap-1 p-1 max-h-48 overflow-y-auto">
            {specialChars.map((item) => (
              <button
                key={item.char}
                type="button"
                title={item.label}
                onClick={() => editor.chain().focus().insertContent(item.char).run()}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-container rounded font-mono"
              >
                {item.char}
              </button>
            ))}
          </div>
        </TDropdown>

        <TDropdown icon="format_line_spacing" title="Setir araligi">
          {lineHeightChoices.map((choice) => (
            <TRow
              key={choice.value}
              onClick={() =>
                choice.value === "1.5"
                  ? editor.chain().focus().unsetLineHeight().run()
                  : editor.chain().focus().setLineHeight(choice.value).run()
              }
            >
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        <TButton
          icon="format_clear"
          title="Formati temizle"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        />

        <TDivider />

        <TButton
          icon="undo"
          title="Geri qaytar (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <TButton
          icon="redo"
          title="İrəli (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
        />

        <TDivider />

        <TDropdown icon="add_box" title="Bolme elave et">
          {insertChoices.map((choice) => (
            <TRow key={choice.key} onClick={() => onInsert(choice.key)}>
              <Icon name={choice.icon} size={16} className="text-secondary shrink-0" />
              {choice.label}
            </TRow>
          ))}
        </TDropdown>

        {editor.isActive("table") && (
          <>
            <TDivider />
            <TDropdown icon="table_chart" title="Cədvəl əməliyyatları">
              <TRow onClick={() => editor.chain().focus().addRowBefore().run()}>
                <Icon name="expand_less" size={16} className="text-secondary" />
                Üstdə sətir əlavə et
              </TRow>
              <TRow onClick={() => editor.chain().focus().addRowAfter().run()}>
                <Icon name="expand_more" size={16} className="text-secondary" />
                Altda sətir əlavə et
              </TRow>
              <TRow onClick={() => editor.chain().focus().addColumnBefore().run()}>
                <Icon name="chevron_left" size={16} className="text-secondary" />
                Solda sütun əlavə et
              </TRow>
              <TRow onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <Icon name="chevron_right" size={16} className="text-secondary" />
                Sağda sütun əlavə et
              </TRow>
              <div className="h-px bg-outline-variant my-1" />
              <TRow onClick={() => editor.chain().focus().deleteRow().run()}>
                <Icon name="remove" size={16} className="text-error" />
                Sətiri sil
              </TRow>
              <TRow onClick={() => editor.chain().focus().deleteColumn().run()}>
                <Icon name="remove" size={16} className="text-error" />
                Sütunu sil
              </TRow>
              <TRow onClick={() => editor.chain().focus().deleteTable().run()}>
                <Icon name="delete" size={16} className="text-error" />
                Cədvəli tamamilə sil
              </TRow>
            </TDropdown>
          </>
        )}

        <span className="ml-auto text-outline font-label text-label-sm">
          {editor.storage.characterCount?.words() ?? 0} soz
        </span>
      </div>

      {popover && (
        <div className="rounded-md border border-secondary/40 bg-surface-container-lowest p-space-sm flex flex-col gap-space-xs">
          <span className="font-label text-label-sm text-on-surface-variant">
            Seçilmiş mətn hara keçid etsin?
          </span>
          <div className="flex items-center gap-space-xs">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
                if (e.key === "Escape") setPopover(null);
              }}
              placeholder="https://..."
              className="flex-1 rounded-md border border-outline-variant bg-surface px-space-sm py-1.5 font-body text-body-sm outline-none focus:border-primary-container"
            />
            <button
              type="button"
              onClick={apply}
              className="inline-flex items-center gap-1 h-9 px-space-sm rounded-md bg-secondary text-on-secondary font-label text-label-sm"
            >
              <Icon name="check" size={15} />
              Əlavə et
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/** Boş sətirdə çıxan ⊕ menyusu */
export function InsertPopover({ onInsert }: { onInsert: (kind: InsertKey) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        title="Bölmə əlavə et"
        aria-label="Bölmə əlavə et"
        className="w-7 h-7 -ms-9 flex items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
      >
        <Icon name="add" size={16} />
      </button>
      {open && (
        <div className="absolute z-30 top-8 start-0 w-52 rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 p-1 flex flex-col">
          {insertChoices.map((choice) => (
            <button
              key={choice.key}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onInsert(choice.key);
                setOpen(false);
              }}
              className="flex items-center gap-space-xs px-space-xs h-9 rounded font-label text-label-md text-on-surface hover:bg-surface-container text-start"
            >
              <Icon name={choice.icon} size={17} className="text-secondary" />
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
