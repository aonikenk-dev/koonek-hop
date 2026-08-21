import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T>) {
  const { t } = useApp();

  if (rows.length === 0) {
    return (
      <div className="kpi-card flex items-center justify-center py-12 text-sm text-muted">
        {emptyMessage ?? t('common.noResults')}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-left px-4 py-3 text-2xs font-mono uppercase tracking-wide text-muted',
                  col.sortable && 'cursor-pointer select-none hover:text-text transition-colors',
                  col.className,
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortBy === col.key ? (
                      sortOrder === 'asc'
                        ? <ChevronUp size={12} className="text-moss" />
                        : <ChevronDown size={12} className="text-moss" />
                    ) : (
                      <ChevronsUpDown size={12} className="opacity-30" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={clsx('table-row-hover', onRowClick && 'cursor-pointer')}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-text', col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
