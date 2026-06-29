import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { patients, type Patient } from '@/data/mock/patients';
import Table, { type Column } from '@/components/ui/Table';

export default function HealthRecords() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { openTab } = useWorkspaceTabs();
  const [search, setSearch] = useState('');

  const filtered = search
    ? patients.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          p.documentId.includes(search)
      )
    : patients;

  const openRecord = (patient: Patient) => {
    openTab({
      key: `health-record:${patient.id}`,
      kind: 'healthRecord',
      label: `${patient.firstName} ${patient.lastName}`,
      path: `/health-records/${patient.id}`,
    });
    navigate(`/health-records/${patient.id}`);
  };

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: t('patients.table.name'),
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <Users size={11} className="text-moss" />
          </div>
          <span className="font-medium text-text text-sm">
            {p.firstName} {p.lastName}
          </span>
        </div>
      ),
    },
    { key: 'documentId', header: t('patients.table.documentId'), className: 'font-mono text-muted' },
    { key: 'lastVisitAt', header: t('patients.table.lastVisit'), className: 'font-mono text-muted' },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-12',
      render: (p) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRecord(p);
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('healthRecords.viewRecord')}
          >
            <FileText size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 bg-surface border border-border rounded px-3 py-1.5 w-64">
        <Search size={13} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('healthRecords.searchPlaceholder')}
          className="text-sm font-mono text-text bg-transparent outline-none flex-1"
        />
      </div>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        onRowClick={openRecord}
        emptyMessage={t('common.noResults')}
      />
    </div>
  );
}
