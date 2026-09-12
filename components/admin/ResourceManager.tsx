"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, SearchBar, SelectField, TextAreaField, TextField } from "@/components/ui";
import { DataCell, DataRow, DataTable } from "./DataTable";
import { ConfirmButton } from "./ConfirmButton";
import Image from "next/image";
import { ChoiceGroup } from "./ChoiceGroup";
import { FilePicker } from "./FilePicker";
import { IconPicker } from "./IconPicker";
import { ImagePicker } from "./ImagePicker";
import { StatusPill } from "./StatusPill";
import { coverOptions } from "@/lib/admin/covers";
import type {
  ResourceActions,
  ResourceColumn,
  ResourceField,
  ResourceRow,
} from "@/lib/admin/types";
import type { MediaScope } from "@/lib/admin/storage/scope";
import { cn } from "@/lib/utils";

/**
 * `scope`-da bu dəyəri yazsanız, `keyField`-in cari qiyməti ilə əvəz
 * olunur. Server Component-dən Client Component-ə sadə funksiya keçmək
 * olmadığı üçün ("use server" tələb olunur) `scope` həmişə düz obyekt
 * qalır — açar sonradan, müştəridə doldurulur.
 */
export const SCOPE_KEY_PLACEHOLDER = "$key";

export interface ResourceManagerProps {
  /**
   * Yüklənən faylların R2-dəki əhatəsi.
   * `keyField` verilibsə, bu obyektdəki `SCOPE_KEY_PLACEHOLDER` ("$key")
   * dəyəri cari qeydin açarı ilə əvəz olunur — hər qeydin öz qovluğu olsun
   * deyə (məs. `{ kind: "protocol", protocolKey: SCOPE_KEY_PLACEHOLDER }`).
   */
  scope?: MediaScope;
  /**
   * Bu sahə adı verilsə, yeni qeyd açılanda ora təsadüfi açar yazılır (və
   * redaktədə qeydin öz `id`-si oxunur) — `scope`-dakı `SCOPE_KEY_PLACEHOLDER`
   * bununla əvəz olunur. Beləliklə hər qeydin faylları öz qovluğuna düşür,
   * "Əvvəl yüklənənlər" siyahısı başqa qeydlərin fayllarını göstərmir.
   */
  keyField?: string;
  /** Sətirlər həm göstərilən, həm də forma sahələrini daşıyır */
  items: ResourceRow[];
  columns: ResourceColumn[];
  fields: ResourceField[];
  actions: ResourceActions;
  /** Axtarışın baxdığı sahə adları */
  searchFields: string[];
  labels: {
    addButton: string;
    createTitle: string;
    editTitle: string;
    empty: string;
    searchPlaceholder: string;
  };
  /** Cədvəlin üstündə əlavə məzmun (məs. HelpNote) */
  aside?: ReactNode;
  /** Silmə dialoqunda göstərilən ad üçün sahə */
  nameField?: string;
}

type Mode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; id: string };

/**
 * Sadə qeyd tipləri üçün universal CRUD idarəedicisi.
 * Sahə sxemi (`fields`) və sütunlar (`columns`) ilə idarə olunur — hər modul
 * üçün ayrıca forma yazmağa ehtiyac yoxdur.
 */
function text(row: ResourceRow, field?: string): string {
  if (!field) return "";
  const value = row[field];
  return value === undefined || value === null ? "" : String(value);
}

export function ResourceManager({
  scope: scopeProp = { kind: "site" },
  keyField,
  items,
  columns,
  fields,
  actions,
  searchFields,
  labels,
  aside,
  nameField,
}: ResourceManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>({ kind: "closed" });
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  /** Boş buraxılan konkret sahə — onun altında qırmızı göstərilir, ümumi mesaj yerinə */
  const [errorField, setErrorField] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /*
   * Yalnız açarın özü dəyişəndə yenidən hesablanır — bütün `values`-a bağlı
   * olsaydı, formada hər hərf yazılanda (məs. təsvir sahəsində) `scope`
   * təzə obyekt olardı və `FilePicker`/`ImagePicker` hər dəfə yenidən
   * `listMedia` çağırardı.
   */
  const scopeKeyValue = keyField ? values[keyField] : undefined;
  const scope: MediaScope = useMemo(() => {
    if (!keyField) return scopeProp;
    const key = scopeKeyValue || "yeni";
    const patched = Object.fromEntries(
      Object.entries(scopeProp).map(([k, v]) => [
        k,
        v === SCOPE_KEY_PLACEHOLDER ? key : v,
      ]),
    );
    return patched as MediaScope;
  }, [scopeProp, keyField, scopeKeyValue]);

  /*
   * Yalnız text/textarea/number sahələri həmişə öz altında qırmızı göstərə
   * bilir (TextField/TextAreaField). "select" seçim sayına görə ChoiceGroup-a
   * da çevrilə bilər — o, `error` dəstəkləmir. Belə hallarda ümumi mesaj
   * (aşağıda) saxlanılır ki, xəta gözdən qaçmasın.
   */
  const errorFieldType = fields.find((f) => f.name === errorField)?.type;
  const errorShownInline =
    errorFieldType === "text" ||
    errorFieldType === "number" ||
    errorFieldType === "url" ||
    errorFieldType === "textarea";

  const visible = useMemo(() => {
    const q = query.toLocaleLowerCase("az").trim();
    if (!q) return items;
    return items.filter((row) =>
      searchFields
        .map((f) => text(row, f))
        .join(" ")
        .toLocaleLowerCase("az")
        .includes(q),
    );
  }, [items, query, searchFields]);

  function openCreate() {
    const blank: Record<string, string> = {};
    for (const f of fields) {
      blank[f.name] = f.type === "switch" ? "false" : f.options?.[0]?.value ?? "";
    }
    /* Fayllar bu qeydin öz qovluğuna düşsün deyə — qeyd hələ yaradılmayıb,
     * ona görə açar burada, müştəridə düzəldilir (bax: `keyField`). */
    if (keyField) blank[keyField] = crypto.randomUUID();
    setValues(blank);
    setError(null);
    setErrorField(null);
    setMode({ kind: "create" });
  }

  function openEdit(row: ResourceRow) {
    const next: Record<string, string> = {};
    for (const f of fields) next[f.name] = text(row, f.name);
    if (keyField) next[keyField] = text(row, keyField);
    setValues(next);
    setError(null);
    setErrorField(null);
    setMode({ kind: "edit", id: row.id });
  }

  function submit() {
    const missing = fields.find(
      (f) => f.required && !String(values[f.name] ?? "").trim(),
    );
    if (missing) {
      setError(`«${missing.label}» sahəsi doldurulmalıdır.`);
      setErrorField(missing.name);
      return;
    }
    setErrorField(null);
    startTransition(async () => {
      const result =
        mode.kind === "edit"
          ? await actions.update(mode.id, values)
          : await actions.create(values);
      if (result.success) {
        setMode({ kind: "closed" });
        setError(null);
        router.refresh();
      } else {
        setError(result.message ?? "Əməliyyat alınmadı.");
      }
    });
  }

  function remove(id: string) {
    return actions.remove(id).then((result) => {
      router.refresh();
      return result;
    });
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-80">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={labels.searchPlaceholder}
          />
        </div>
        <Button icon="add" onClick={openCreate} className="shrink-0">
          {labels.addButton}
        </Button>
      </div>

      {aside}

      <div className="rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-1 overflow-hidden">
        <DataTable
          headers={[
            ...columns.map((c) => ({ key: c.key, label: c.header })),
            { key: "actions", label: "", className: "text-end" },
          ]}
          isEmpty={visible.length === 0}
          emptyLabel={labels.empty}
        >
          {visible.map((row) => (
            <DataRow key={row.id}>
              {columns.map((col) => (
                <DataCell key={col.key}>
                  <ColumnCell column={col} row={row} />
                </DataCell>
              ))}
              <DataCell className="text-end whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    title="Redaktə et"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <ConfirmButton
                    onConfirm={() => remove(row.id)}
                    itemName={nameField ? text(row, nameField) : undefined}
                  />
                </span>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      </div>

      {/* Forma modalı */}
      {mode.kind !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-space-md">
          <button
            type="button"
            aria-label="Bağla"
            onClick={() => setMode({ kind: "closed" })}
            className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative my-space-lg w-full max-w-2xl rounded-xl border border-surface-container bg-surface-container-lowest shadow-level-2"
          >
            <div className="flex items-center justify-between gap-space-sm px-space-md h-14 border-b border-surface-container">
              <h2 className="font-headline text-headline-sm text-on-surface">
                {mode.kind === "edit" ? labels.editTitle : labels.createTitle}
              </h2>
              <button
                type="button"
                onClick={() => setMode({ kind: "closed" })}
                aria-label="Bağla"
                className="text-outline hover:text-on-surface"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-space-md grid gap-space-md sm:grid-cols-2">
              {fields.map((field) => {
                const value = values[field.name] ?? "";
                const set = (v: string) =>
                  setValues((prev) => ({ ...prev, [field.name]: v }));
                const span = cn(field.colSpan === 2 && "sm:col-span-2");

                if (field.type === "textarea") {
                  return (
                    <TextAreaField
                      key={field.name}
                      label={field.label}
                      required={field.required}
                      hint={field.hint}
                      rows={field.rows ?? 4}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      error={field.name === errorField ? error ?? undefined : undefined}
                      className={span}
                    />
                  );
                }
                if (field.type === "icon") {
                  return (
                    <IconPicker
                      key={field.name}
                      label={field.label}
                      hint={field.hint}
                      value={value}
                      onChange={set}
                      className={span}
                    />
                  );
                }
                if (field.type === "image") {
                  return (
                    <ImagePicker
                      key={field.name}
                      scope={scope}
                      label={field.label}
                      hint={field.hint}
                      value={value}
                      options={coverOptions}
                      onChange={set}
                      className="sm:col-span-2"
                    />
                  );
                }
                if (field.type === "file") {
                  return (
                    <div key={field.name} className={cn("flex flex-col gap-space-2xs", span)}>
                      <span className="font-label text-label-md text-on-surface-variant">
                        {field.label}
                      </span>
                      {field.hint && (
                        <span className="font-label text-label-sm text-outline">
                          {field.hint}
                        </span>
                      )}
                      <FilePicker
                        scope={scope}
                        value={value}
                        onSelect={(file) =>
                          setValues((prev) => ({
                            ...prev,
                            [field.name]: file.url,
                            ...(field.sizeField && { [field.sizeField]: file.sizeLabel }),
                          }))
                        }
                      />
                    </div>
                  );
                }
                if (field.type === "select") {
                  const options = field.options ?? [];
                  // Az sayda variant varsa açılan siyahı əvəzinə görünən düymələr
                  if (options.length > 0 && options.length <= 5) {
                    return (
                      <ChoiceGroup
                        key={field.name}
                        label={field.label}
                        hint={field.hint}
                        value={value}
                        options={options}
                        onChange={set}
                        className={span}
                      />
                    );
                  }
                  return (
                    <SelectField
                      key={field.name}
                      label={field.label}
                      required={field.required}
                      hint={field.hint}
                      options={options}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      error={field.name === errorField ? error ?? undefined : undefined}
                      className={span}
                    />
                  );
                }
                if (field.type === "switch") {
                  const on = value === "true";
                  return (
                    <div key={field.name} className={cn("flex flex-col gap-space-2xs", span)}>
                      <span className="font-label text-label-md text-on-surface-variant">
                        {field.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => set(on ? "false" : "true")}
                        aria-pressed={on}
                        className={cn(
                          "inline-flex w-fit items-center gap-space-xs h-10 px-space-sm rounded-md border font-label text-label-lg transition-colors",
                          on
                            ? "border-secondary/40 bg-secondary/10 text-on-secondary-container"
                            : "border-outline-variant text-on-surface-variant",
                        )}
                      >
                        <Icon name={on ? "toggle_on" : "toggle_off"} size={20} />
                        {on ? "Aktiv" : "Deaktiv"}
                      </button>
                      {field.hint && (
                        <span className="font-label text-label-sm text-outline">
                          {field.hint}
                        </span>
                      )}
                    </div>
                  );
                }
                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    required={field.required}
                    hint={field.hint}
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    error={field.name === errorField ? error ?? undefined : undefined}
                    className={span}
                  />
                );
              })}

              {/* errorShownInline olanda mesaj artıq həmin sahənin altında
               * görünür — burada yalnız sahəyə bağlanmayan (server) xətalar
               * və inline dəstəkləməyən sahə növləri (seçim, şəkil və s.) qalır */}
              {error && !errorShownInline && (
                <p className="sm:col-span-2 flex items-center gap-1 font-label text-label-sm text-error">
                  <Icon name="error" size={14} />
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-space-xs px-space-md py-space-sm border-t border-surface-container bg-surface-container-low/50">
              <Button
                variant="secondary"
                onClick={() => setMode({ kind: "closed" })}
              >
                Bağla
              </Button>
              <Button icon="save" onClick={submit} disabled={pending}>
                {pending ? "Yadda saxlanılır..." : "Yadda saxla"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Sütun təsvirinə görə xananı çizir */
function ColumnCell({
  column,
  row,
}: {
  column: ResourceColumn;
  row: ResourceRow;
}) {
  if (column.type === "primary") {
    const icon = column.iconField ? text(row, column.iconField) : column.icon;
    return (
      <span className="flex items-start gap-space-xs max-w-lg">
        {icon && (
          <span className="mt-0.5 w-8 h-8 shrink-0 rounded-md bg-secondary/10 flex items-center justify-center text-secondary">
            <Icon name={icon} size={16} />
          </span>
        )}
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-label text-label-lg text-on-surface line-clamp-2">
            {text(row, column.titleField)}
          </span>
          {column.subtitleField && (
            <span className="font-body text-body-sm text-on-surface-variant line-clamp-1">
              {text(row, column.subtitleField)}
            </span>
          )}
        </span>
      </span>
    );
  }

  if (column.type === "thumb") {
    return (
      <span className="flex items-center gap-space-sm max-w-lg">
        <span className="relative w-20 h-12 shrink-0 rounded-md overflow-hidden bg-surface-container-high">
          <Image
            src={text(row, column.imageField) || "/images/video-ekg.svg"}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </span>
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="font-label text-label-lg text-on-surface line-clamp-1">
            {text(row, column.titleField)}
          </span>
          {column.subtitleField && (
            <span className="font-label text-label-sm text-outline line-clamp-1">
              {text(row, column.subtitleField)}
            </span>
          )}
        </span>
      </span>
    );
  }

  if (column.type === "badge") {
    return <StatusPill label={text(row, column.field)} tone={column.tone ?? "neutral"} />;
  }

  return (
    <span
      className={cn(
        "font-label text-label-md whitespace-nowrap",
        column.muted ? "text-outline" : "text-on-surface-variant",
      )}
    >
      {column.prefix}
      {text(row, column.field)}
    </span>
  );
}
