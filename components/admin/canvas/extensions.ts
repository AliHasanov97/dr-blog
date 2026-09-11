import { Extension, Mark, Node, mergeAttributes } from "@tiptap/core";
import Blockquote from "@tiptap/extension-blockquote";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from "./ImageNodeView";
import { SliderNodeView } from "./SliderNodeView";
import { GalleryNodeView } from "./GalleryNodeView";
import { VideoNodeView } from "./VideoNodeView";
import { FileNodeView } from "./FileNodeView";

/* --------------------------------------------------------------
 * Sətir aralığı — paragraph və heading-ə tətbiq olunur
 * ------------------------------------------------------------ */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight,
                });
              }
              changed = true;
            }
          });

          return changed;
        },
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              if (dispatch) {
                const { lineHeight, ...rest } = node.attrs;
                tr.setNodeMarkup(pos, undefined, rest);
              }
              changed = true;
            }
          });

          return changed;
        },
    };
  },
});

/**
 * Redaktorun öz blok və işarə tipləri.
 * Hər biri `lib/editor/document.ts`-dəki HTML forması ilə eyni oxunur/yazılır.
 */

/* --------------------------------------------------------------
 * Şəkil
 * ------------------------------------------------------------ */

export const ImageBlock = Node.create({
  name: "imageBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "", parseHTML: (el) => el.getAttribute("data-src") ?? "" },
      alt: { default: "", parseHTML: (el) => el.getAttribute("data-alt") ?? "" },
      caption: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-caption") ?? "",
      },
      align: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-align") ?? "full",
      },
      width: {
        default: 50,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || 50,
      },
      aspectRatio: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-aspect-ratio") || null,
      },
      fit: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-fit") || null,
      },
      focus: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-focus") || null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block="image"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, align, width, aspectRatio, fit, focus } =
      HTMLAttributes as Record<string, string>;
    return [
      "div",
      mergeAttributes({
        "data-block": "image",
        "data-src": src ?? "",
        "data-alt": alt ?? "",
        "data-caption": caption ?? "",
        "data-align": align ?? "full",
        "data-width": String(width ?? 50),
        ...(aspectRatio ? { "data-aspect-ratio": aspectRatio } : {}),
        ...(fit ? { "data-fit": fit } : {}),
        ...(focus ? { "data-focus": focus } : {}),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

/* --------------------------------------------------------------
 * Slayd
 * ------------------------------------------------------------ */

export const SliderBlock = Node.create({
  name: "sliderBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      items: {
        default: "[]",
        parseHTML: (el) => el.getAttribute("data-items") ?? "[]",
      },
      align: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-align") ?? "full",
      },
      width: {
        default: 50,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || 50,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block="slider"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { items, align, width } = HTMLAttributes as Record<string, string>;
    return [
      "div",
      mergeAttributes({
        "data-block": "slider",
        "data-items": items ?? "[]",
        "data-align": align ?? "full",
        "data-width": String(width ?? 50),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SliderNodeView);
  },
});

/* --------------------------------------------------------------
 * Şəkil cərgəsi — bir neçə şəkil eyni sətirdə, yan-yana
 * ------------------------------------------------------------ */

export const GalleryBlock = Node.create({
  name: "imageGroupBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      items: {
        default: "[]",
        parseHTML: (el) => el.getAttribute("data-items") ?? "[]",
      },
      align: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-align") ?? "full",
      },
      width: {
        default: 50,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || 50,
      },
      columns: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-columns") || null,
      },
      aspectRatio: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-aspect-ratio") || null,
      },
      fit: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-fit") || null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block="imageGroup"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { items, align, width, columns, aspectRatio, fit } =
      HTMLAttributes as Record<string, string>;
    return [
      "div",
      mergeAttributes({
        "data-block": "imageGroup",
        "data-items": items ?? "[]",
        "data-align": align ?? "full",
        "data-width": String(width ?? 50),
        ...(columns ? { "data-columns": columns } : {}),
        ...(aspectRatio ? { "data-aspect-ratio": aspectRatio } : {}),
        ...(fit ? { "data-fit": fit } : {}),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView);
  },
});

/* --------------------------------------------------------------
 * Video
 * ------------------------------------------------------------ */

export const VideoBlock = Node.create({
  name: "videoBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      videoId: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-video-id") ?? "",
      },
      caption: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-caption") ?? "",
      },
      align: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-align") ?? "full",
      },
      width: {
        default: 50,
        parseHTML: (el) => Number(el.getAttribute("data-width")) || 50,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block="video"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { videoId, caption, align, width } = HTMLAttributes as Record<
      string,
      string
    >;
    return [
      "div",
      mergeAttributes({
        "data-block": "video",
        "data-video-id": videoId ?? "",
        "data-caption": caption ?? "",
        "data-align": align ?? "full",
        "data-width": String(width ?? 50),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

/* --------------------------------------------------------------
 * Endirilə bilən fayl (PDF, DOC, XLS)
 * ------------------------------------------------------------ */

export const FileBlock = Node.create({
  name: "fileBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: "", parseHTML: (el) => el.getAttribute("data-url") ?? "" },
      title: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-title") ?? "",
      },
      extension: {
        default: "PDF",
        parseHTML: (el) => el.getAttribute("data-extension") || "PDF",
      },
      size: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-size") ?? "",
      },
      description: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-description") ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block="file"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { url, title, extension, size, description } =
      HTMLAttributes as Record<string, string>;
    return [
      "div",
      mergeAttributes({
        "data-block": "file",
        "data-url": url ?? "",
        "data-title": title ?? "",
        "data-extension": extension ?? "PDF",
        "data-size": size ?? "",
        "data-description": description ?? "",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView);
  },
});

/* --------------------------------------------------------------
 * Sitat — üst etiket və müəllif adı atribut kimi saxlanılır
 * ------------------------------------------------------------ */

export const QuoteBlock = Blockquote.extend({
  addAttributes() {
    return {
      label: {
        default: "Həkimin tövsiyəsi",
        parseHTML: (el) => el.getAttribute("data-label") || "Həkimin tövsiyəsi",
        renderHTML: (attrs) => ({ "data-label": attrs.label as string }),
      },
      by: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-by") ?? "",
        renderHTML: (attrs) =>
          attrs.by ? { "data-by": attrs.by as string } : {},
      },
      icon: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-icon") ?? "",
        renderHTML: (attrs) =>
          attrs.icon ? { "data-icon": attrs.icon as string } : {},
      },
    };
  },
});

/* --------------------------------------------------------------
 * Lüğət termini — `[term=...]`
 * ------------------------------------------------------------ */

export const TermMark = Mark.create({
  name: "term",

  addAttributes() {
    return {
      value: {
        default: "",
        parseHTML: (el) =>
          el.getAttribute("data-value") || el.getAttribute("title") || "",
        renderHTML: (attrs) => ({
          "data-value": attrs.value as string,
          title: attrs.value as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "abbr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["abbr", mergeAttributes({ "data-bb": "term" }, HTMLAttributes), 0];
  },
});

/* --------------------------------------------------------------
 * İstinad nömrəsi — `[ref=N]`
 * ------------------------------------------------------------ */

export const RefNode = Node.create({
  name: "refMark",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      number: {
        default: "1",
        parseHTML: (el) => el.getAttribute("data-ref") ?? "1",
      },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-ref]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { number } = HTMLAttributes as Record<string, string>;
    return [
      "sup",
      mergeAttributes({ "data-bb": "ref", "data-ref": number ?? "1" }),
      number ?? "1",
    ];
  },
});
