import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface DataTableProps {
  headers: { key: string; label: string; className?: string }[];
  children: ReactNode;
  /** Sətir yoxdursa göstərilən mətn */
  emptyLabel?: string;
  isEmpty?: boolean;
  className?: string;
}

/** Üfüqi sürüşən cədvəl karkası — mobil ekranda içəridə scroll olur */
export function DataTable({
  headers,
  children,
  emptyLabel = "Qeyd tapılmadı",
  isEmpty = false,
  className,
}: DataTableProps) {
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-space-xs py-space-2xl text-center">
        <Icon name="inbox" size={34} className="text-outline" />
        <p className="font-body text-body-sm text-on-surface-variant">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[44rem] border-collapse">
        <thead>
          <tr className="border-b border-surface-container">
            {headers.map((h) => (
              <th
                key={h.key}
                scope="col"
                className={cn(
                  "px-space-md py-space-sm text-start font-label text-label-sm uppercase tracking-wider text-outline whitespace-nowrap",
                  h.className,
                )}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">{children}</tbody>
      </table>
    </div>
  );
}

export function DataCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-space-md py-space-sm align-middle", className)}>
      {children}
    </td>
  );
}

export function DataRow({ children }: { children: ReactNode }) {
  return (
    <tr className="hover:bg-surface-container-low/60 transition-colors">
      {children}
    </tr>
  );
}
