import { Trash2, Pill } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { Prescription } from '@/data/mock/prescriptions';
import Table, { type Column } from '@/components/ui/Table';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  /** Hide the patient column when the list is already scoped to one patient. */
  showPatientColumn?: boolean;
  onDelete: (prescription: Prescription) => void;
  onRowClick?: (prescription: Prescription) => void;
  emptyMessage?: string;
}

export default function PrescriptionList({
  prescriptions,
  showPatientColumn = true,
  onDelete,
  onRowClick,
  emptyMessage,
}: PrescriptionListProps) {
  const { t } = useApp();

  const columns: Column<Prescription>[] = [
    ...(showPatientColumn
      ? [{ key: 'patientName', header: t('prescriptions.table.patient') } satisfies Column<Prescription>]
      : []),
    { key: 'date', header: t('prescriptions.table.date'), className: 'font-mono text-muted' },
    { key: 'doctorName', header: t('prescriptions.table.doctor') },
    {
      key: 'diagnosis',
      header: t('prescriptions.table.diagnosis'),
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.diagnosis || '—'}
          {p.frequent && <span className="badge-glacier text-2xs">{t('prescriptions.form.frequent')}</span>}
        </div>
      ),
    },
    {
      key: 'items',
      header: t('prescriptions.table.items'),
      render: (p) => (
        <div className="flex items-center gap-2">
          <Pill size={13} className="text-glacier shrink-0" />
          <span className="text-muted">{p.items.map((i) => i.drug).join(', ')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-12',
      render: (p) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(p);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('prescriptions.delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={prescriptions}
      rowKey={(p) => p.id}
      onRowClick={onRowClick}
      emptyMessage={emptyMessage ?? t('prescriptions.empty')}
    />
  );
}
