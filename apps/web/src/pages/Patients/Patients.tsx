import { useState, type FormEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { patients as mockPatients, type Patient, type PatientStatus } from '@/data/mock/patients';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type PatientFormValues = Pick<Patient, 'firstName' | 'lastName' | 'documentId' | 'email' | 'phoneNumber'>;

const EMPTY_FORM: PatientFormValues = { firstName: '', lastName: '', documentId: '', email: '', phoneNumber: '' };

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Patient } | null;

interface PatientModalProps {
  mode: 'create' | 'edit';
  initial?: Patient;
  onSave: (form: PatientFormValues) => void;
  onClose: () => void;
}

function PatientModal({ mode, initial, onSave, onClose }: PatientModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<PatientFormValues>(initial ?? EMPTY_FORM);

  const set = (field: keyof PatientFormValues, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={mode === 'create' ? t('patients.new') : t('patients.edit')}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('patients.form.firstName')}
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
          <Input
            label={t('patients.form.lastName')}
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
          <Input
            label={t('patients.form.documentId')}
            required
            value={form.documentId}
            onChange={(e) => set('documentId', e.target.value)}
          />
          <Input
            label={t('patients.form.email')}
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <div className="col-span-2">
            <Input
              label={t('patients.form.phone')}
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              placeholder="+54 9 ..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" className="text-xs" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="text-xs">
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const STATUS_BADGE: Record<PatientStatus, string> = {
  active: 'badge-moss',
  inactive: 'badge-muted',
};

export default function Patients() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { openTab } = useWorkspaceTabs();

  const openPatient = (p: Patient) => {
    openTab({ key: `patient:${p.id}`, kind: 'patient', label: `${p.firstName} ${p.lastName}`, path: `/patients/${p.id}` });
    navigate(`/patients/${p.id}`);
  };
  const [list, setList] = useState<Patient[]>(mockPatients);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<Patient | null>(null);

  const filtered = search
    ? list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          p.documentId.includes(search)
      )
    : list;

  const handleSave = (form: PatientFormValues) => {
    if (modalState?.mode === 'create') {
      setList((prev) => [
        ...prev,
        {
          ...form,
          id: `p-${Date.now()}`,
          lastVisitAt: '—',
          status: 'active',
          nationalIdType: 'DNI',
          dateOfBirth: '',
          healthRecordNumber: `HC-${String(prev.length + 1).padStart(4, '0')}`,
          healthInsurance: null,
        },
      ]);
    } else if (modalState?.mode === 'edit') {
      setList((prev) => prev.map((p) => (p.id === modalState.data.id ? { ...p, ...form } : p)));
    }
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    setConfirmDelete(null);
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
    { key: 'email', header: t('patients.table.email'), className: 'font-mono text-muted' },
    { key: 'phoneNumber', header: t('patients.table.phone'), className: 'font-mono text-muted' },
    { key: 'lastVisitAt', header: t('patients.table.lastVisit'), className: 'font-mono text-muted' },
    {
      key: 'status',
      header: t('patients.table.status'),
      render: (p) => <span className={clsx(STATUS_BADGE[p.status], 'text-xs')}>{t(`patients.statusOptions.${p.status}`)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (p) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModalState({ mode: 'edit', data: p });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('patients.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setConfirmDelete(p);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('patients.delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('patients.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button leftIcon={<Plus size={14} />} className="ml-auto text-xs h-9" onClick={() => setModalState({ mode: 'create' })}>
          {t('patients.new')}
        </Button>
      </div>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        onRowClick={openPatient}
        emptyMessage={search ? t('common.noResults') : t('patients.empty')}
      />

      {modalState && (
        <PatientModal
          mode={modalState.mode}
          initial={modalState.mode === 'edit' ? modalState.data : undefined}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title={t('patients.delete')}
        message={t('patients.deleteConfirm', { name: confirmDelete ? `${confirmDelete.firstName} ${confirmDelete.lastName}` : '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
