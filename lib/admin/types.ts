/** Server Action-ların standart cavabı */
export interface ActionResult {
  success: boolean;
  message?: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "url"
  /** Vizual ikon seçici (ad yazmaq əvəzinə şəkilə klik) */
  | "icon"
  /** Vizual şəkil seçici */
  | "image";

export interface ResourceField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: readonly { value: string; label: string }[];
  /** Formda tutduğu sütun sayı (2 sütunlu grid) */
  colSpan?: 1 | 2;
  rows?: number;
}

/**
 * Cədvəl sütunu — SERİALİZASİYA OLUNA BİLƏN təsvir.
 * Server komponentdən klient komponentə funksiya ötürmək mümkün olmadığı üçün
 * render məntiqi deyil, sahə adları ötürülür.
 */
export type ResourceColumn =
  | {
      key: string;
      header: string;
      type: "primary";
      titleField: string;
      subtitleField?: string;
      /** Sətrin əvvəlindəki Material Symbols ikonunu saxlayan sahə */
      iconField?: string;
      /** Sabit ikon (iconField verilmədikdə) */
      icon?: string;
    }
  | {
      key: string;
      header: string;
      type: "thumb";
      imageField: string;
      titleField: string;
      subtitleField?: string;
    }
  | {
      key: string;
      header: string;
      type: "text";
      field: string;
      muted?: boolean;
      prefix?: string;
    }
  | {
      key: string;
      header: string;
      type: "badge";
      field: string;
      tone?: "success" | "warning" | "danger" | "neutral" | "info";
    };

/** ResourceManager-in işlədiyi sətir forması — bütün dəyərlər sadə tiplərdir */
export type ResourceRow = { id: string } & Record<string, string | number | undefined>;

/** Generik CRUD səhifəsinə ötürülən server action-lar */
export interface ResourceActions {
  create: (values: Record<string, string>) => Promise<ActionResult>;
  update: (id: string, values: Record<string, string>) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
}
