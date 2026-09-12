"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
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
  GalleryBlock,
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
import { Toolbar, InsertPopover } from "./Toolbar";
import type { InsertKey } from "./choices";
import { blocksToEditorHtml, editorHtmlToBlocks } from "@/lib/editor/document";
import type { ArticleBlock } from "@/lib/types";

export interface ArticleCanvasProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  /** Redaktə olunan məqalənin açarı — yüklənən fayllar onun qovluğuna düşür */
  articleKey: string;
}

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
    kind: "image" | "slider" | "imageGroup";
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
      GalleryBlock,
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
      case "imageGroup":
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
          attrs: { src, alt: "", caption: "", align: "full", width: 50 },
        })
        .run();
    } else if (picker.kind === "imageGroup") {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "imageGroupBlock",
          attrs: {
            items: JSON.stringify([{ src, alt: "", caption: "" }]),
            align: "full",
            width: 50,
          },
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
              : picker.kind === "imageGroup"
                ? "Cərgənin ilk şəkli"
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
