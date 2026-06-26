import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage,
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
                className={clsx('text-left px-4 py-3 text-2xs font-mono uppercase tracking-wide text-muted', col.className)}
              >
                {col.header}
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
