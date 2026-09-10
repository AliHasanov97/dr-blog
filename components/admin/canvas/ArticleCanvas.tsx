"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Icon } from "@/components/ui";
import { ImagePicker } from "../ImagePicker";
import { coverOptions } from "@/lib/admin/covers";
import { ArticleMediaProvider } from "./ArticleMediaContext";
import type { MediaScope } from "@/lib/admin/storage/scope";
import {
  FileBlock,
  ImageBlock,
  LineHeight,
  QuoteBlock,
  RefNode,
  SliderBlock,
  TermMark,
  VideoBlock,
} from "./extensions";
import { CanvasContextMenu } from "./CanvasContextMenu";
import { FloatingPanel } from "./FloatingPanel";
import { blocksToEditorHtml, editorHtmlToBlocks } from "@/lib/editor/document";
import type { ArticleBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ArticleCanvasProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  /** Redaktə olunan məqalənin açarı — yüklənən fayllar onun qovluğuna düşür */
  articleKey: string;
}

/* --------------------------------------------------------------
 * Alət zolağının seçimləri — hamısı sadə dildə
 * ------------------------------------------------------------ */

const colorChoices = [
  { hex: "", label: "Adi rəng", swatch: "#1c1b1f" },
  { hex: "#1b6b51", label: "Yaşıl vurğu", swatch: "#1b6b51" },
  { hex: "#ba1a1a", label: "Qırmızı xəbərdarlıq", swatch: "#ba1a1a" },
  { hex: "#131b2e", label: "Tünd göy", swatch: "#131b2e" },
  { hex: "#45464d", label: "Solğun boz", swatch: "#45464d" },
];

const sizeChoices = [
  { value: "", label: "Standart" },
  { value: "12px", label: "12 px" },
  { value: "14px", label: "14 px" },
  { value: "16px", label: "16 px" },
  { value: "18px", label: "18 px" },
  { value: "20px", label: "20 px" },
  { value: "24px", label: "24 px" },
  { value: "28px", label: "28 px" },
  { value: "32px", label: "32 px" },
  { value: "36px", label: "36 px" },
  { value: "48px", label: "48 px" },
];

const fontChoices = [
  { value: "", label: "Standart" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Palatino, serif", label: "Palatino" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Lucida Console, monospace", label: "Lucida Console" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
  { value: "Impact, sans-serif", label: "Impact" },
];

const alignChoices = [
  { value: "left", label: "Sola", icon: "format_align_left" },
  { value: "center", label: "Ortaya", icon: "format_align_center" },
  { value: "right", label: "Sağa", icon: "format_align_right" },
  { value: "justify", label: "Eninə yay", icon: "format_align_justify" },
];

const insertChoices = [
  { key: "heading", icon: "title", label: "Basliq" },
  { key: "quote", icon: "format_quote", label: "Sitat" },
  { key: "bulletList", icon: "format_list_bulleted", label: "Noqteli siyahi" },
  { key: "orderedList", icon: "format_list_numbered", label: "Nomreli siyahi" },
  { key: "table", icon: "table_chart", label: "Cedvel" },
  { key: "codeBlock", icon: "code", label: "Kod bloku" },
  { key: "horizontalRule", icon: "horizontal_rule", label: "Ufuqi xett" },
  { key: "image", icon: "image", label: "Sekil" },
  { key: "slider", icon: "gallery_thumbnail", label: "Slayd" },
  { key: "video", icon: "smart_display", label: "Video" },
  { key: "file", icon: "attach_file", label: "Fayl (PDF)" },
] as const;

type InsertKey = (typeof insertChoices)[number]["key"];

const lineHeightChoices = [
  { value: "1", label: "Sıx" },
  { value: "1.5", label: "Normal" },
  { value: "2", label: "Geniş" },
  { value: "2.5", label: "Çox geniş" },
];

const specialChars = [
  { char: "©", label: "Copyright" },
  { char: "®", label: "Registered" },
  { char: "™", label: "Trademark" },
  { char: "→", label: "Arrow right" },
  { char: "←", label: "Arrow left" },
  { char: "↑", label: "Arrow up" },
  { char: "↓", label: "Arrow down" },
  { char: "≤", label: "Less or equal" },
  { char: "≥", label: "Greater or equal" },
  { char: "±", label: "Plus minus" },
  { char: "°", label: "Degree" },
  { char: "µ", label: "Micro" },
  { char: "α", label: "Alpha" },
  { char: "β", label: "Beta" },
  { char: "γ", label: "Gamma" },
  { char: "Δ", label: "Delta" },
  { char: "∞", label: "Infinity" },
  { char: "√", label: "Square root" },
  { char: "∑", label: "Sum" },
  { char: "π", label: "Pi" },
];

const commonEmojis = [
  "😊", "👍", "❤️", "🏥", "💊", "💉", "🩺", "🫀", "🧠", "🦴",
  "⚠️", "✅", "❌", "ℹ️", "📌", "📋", "📊", "📈", "🔬", "🧪",
];

/**
 * Məqalə mətninin redaktoru — tək kətan.
 *
 * Yazdığınız mətn saytdakı kimi görünür; şəkil, slayd və video isə kətanın
 * içində hazır blok kimi durur. Daxildə `ArticleBlock[]` formatı saxlanılır,
 * ona görə backend müqaviləsi dəyişmir.
 */
export function ArticleCanvas({
  blocks,
  onChange,
  articleKey,
}: ArticleCanvasProps) {
  /* Kətandan yüklənən şəkillər məqalənin öz qovluğuna düşür */
  const bodyScope = useMemo<MediaScope>(
    () => ({ kind: "article", articleKey, part: "body" }),
    [articleKey],
  );
  /** Şəkil seçici — hansı blok üçün və ekranın hansı nöqtəsində açılsın */
  const [picker, setPicker] = useState<{
    kind: "image" | "slider";
    x: number;
    y: number;
  } | null>(null);
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  /** Redaktorun özünün göndərdiyi son blok siyahısı */
  const lastEmitted = useRef<string>(JSON.stringify(blocks));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      QuoteBlock,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight,
      Underline,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "editor-table" },
      }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount,
      LineHeight,
      TextAlign.configure({
        types: ["paragraph", "heading"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TermMark,
      RefNode,
      ImageBlock,
      SliderBlock,
      VideoBlock,
      FileBlock,
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "heading"
            ? "Bolme basligi..."
            : "Buraya yazin. Format ucun metni secin, bolme ucun + duymeye basin.",
      }),
    ],
    content: blocksToEditorHtml(blocks),
    editorProps: {
      attributes: {
        class: "article-canvas outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      const next = editorHtmlToBlocks(current.getHTML());
      lastEmitted.current = JSON.stringify(next);
      onChange(next);
    },
  });

  /*
   * Blok siyahısı yalnız KƏNARDAN dəyişəndə kətan yenidən doldurulur
   * (məsələn qaralama bərpa ediləndə). Redaktorun öz dəyişikliyində bu baş
   * verməməlidir — əks halda hər hərfdən sonra kursor itər.
   */
  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(blocks);
    if (incoming === lastEmitted.current) return;
    lastEmitted.current = incoming;
    editor.commands.setContent(blocksToEditorHtml(blocks), {
      emitUpdate: false,
    });
  }, [editor, blocks]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-outline-variant py-space-xl text-center font-body text-body-sm text-outline">
        Redaktor hazırlanır...
      </div>
    );
  }

  /**
   * Bölmə əlavə edir.
   * `at` verilməsə, panel kursorun durduğu yerdə açılır — beləliklə həm sağ
   * klikdə, həm də alət zolağından seçəndə panel gözün olduğu yerdə çıxır.
   */
  function insert(kind: InsertKey, at?: { x: number; y: number }) {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (kind) {
      case "heading":
        chain.setNode("heading", { level: 2 }).run();
        break;
      case "quote":
        chain.toggleWrap("blockquote").run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "table":
        chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
      case "horizontalRule":
        chain.setHorizontalRule().run();
        break;
      case "image":
      case "slider":
        setPicker({ kind, ...(at ?? caretPoint()) });
        break;
      case "video":
        chain
          .insertContent({ type: "videoBlock", attrs: { videoId: "", caption: "" } })
          .run();
        break;
      case "file":
        chain.insertContent({ type: "fileBlock", attrs: { url: "" } }).run();
        break;
    }
  }

  /** Kursorun ekrandakı yeri — panel oradan açılsın deyə */
  function caretPoint(): { x: number; y: number } {
    if (!editor) return { x: 0, y: 0 };
    try {
      const coords = editor.view.coordsAtPos(editor.state.selection.from);
      return { x: coords.left, y: coords.bottom + 6 };
    } catch {
      const box = editor.view.dom.getBoundingClientRect();
      return { x: box.left + 24, y: box.top + 24 };
    }
  }

  function insertMedia(src: string) {
    if (!editor || !picker) return;
    if (picker.kind === "image") {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "imageBlock",
          attrs: { src, alt: "", caption: "", align: "full", width: "half" },
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "sliderBlock",
          attrs: { items: JSON.stringify([{ src, alt: "", caption: "" }]) },
        })
        .run();
    }
    setPicker(null);
  }

  const inList = editor.isActive("bulletList");

  return (
    <ArticleMediaProvider articleKey={articleKey}>
    <div className="flex flex-col gap-space-sm">
      <Toolbar editor={editor} onInsert={insert} />

      {inList && (
        <p className="flex items-center gap-1 font-label text-label-sm text-outline">
          <Icon name="lightbulb" size={14} />
          Bəndin başlığını yazıb <strong className="mx-0.5">Shift+Enter</strong>{" "}
          bassanız, altında izah sətri açılır.
        </p>
      )}

      <div
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-space-md py-space-md"
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuAt({ x: event.clientX, y: event.clientY });
        }}
      >
        <FloatingMenu
          editor={editor}
          options={{ placement: "left-start", offset: 8 }}
        >
          <InsertPopover onInsert={insert} />
        </FloatingMenu>
        <EditorContent editor={editor} />
      </div>

      <CanvasContextMenu
        editor={editor}
        position={menuAt}
        onClose={() => setMenuAt(null)}
        onInsert={(kind) => insert(kind as InsertKey, menuAt ?? undefined)}
      />

      {picker && (
        <FloatingPanel
          position={{ x: picker.x, y: picker.y }}
          title={
            picker.kind === "image"
              ? "Hansı şəkli əlavə edək?"
              : "Slaydın ilk şəkli"
          }
          width={420}
          onClose={() => setPicker(null)}
        >
          <ImagePicker
            scope={bodyScope}
            label="Hazır şəkillər"
            hint="Kompüterinizdən yeni şəkil də yükləyə bilərsiniz"
            value=""
            options={coverOptions}
            onChange={insertMedia}
          />
        </FloatingPanel>
      )}
    </div>
    </ArticleMediaProvider>
  );
}

/* --------------------------------------------------------------
 * Alət zolağı — həmişə eyni yerdə, «Word kimi»
 * ------------------------------------------------------------ */

function Toolbar({
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
function InsertPopover({ onInsert }: { onInsert: (kind: InsertKey) => void }) {
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

/* --------------------------------------------------------------
 * Kiçik alət komponentləri
 * ------------------------------------------------------------ */

function TDivider() {
  return <span aria-hidden="true" className="w-px h-5 bg-outline-variant mx-0.5" />;
}

function TButton({
  icon,
  title,
  active = false,
  onClick,
}: {
  icon: string;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded transition-colors",
        active
          ? "bg-secondary text-on-secondary"
          : "text-on-surface-variant hover:bg-surface-container hover:text-secondary",
      )}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

function TDropdown({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-8 px-1.5 flex items-center gap-0.5 rounded transition-colors",
          open
            ? "bg-secondary/12 text-secondary"
            : "text-on-surface-variant hover:bg-surface-container hover:text-secondary",
        )}
      >
        <Icon name={icon} size={17} />
        <Icon name="arrow_drop_down" size={14} />
      </button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-20"
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          />
          <div
            className="absolute z-30 top-9 start-0 w-52 rounded-lg border border-surface-container bg-surface-container-lowest shadow-level-2 p-1 flex flex-col"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function TRow({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-space-xs px-space-xs h-8 rounded font-label text-label-md text-on-surface hover:bg-surface-container text-start"
    >
      {children}
    </button>
  );
}
