import { useState, type FormEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Stethoscope, Calendar, CalendarClock, Power } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { doctors as mockDoctors, doctorLabel, type Doctor, type DoctorStatus } from '@/data/mock/doctors';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type DoctorFormValues = Pick<Doctor, 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'room'> & {
  specialitiesRaw: string;
};

const EMPTY_FORM: DoctorFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  room: '',
  specialitiesRaw: '',
};

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Doctor } | null;

interface DoctorModalProps {
  mode: 'create' | 'edit';
  initial?: Doctor;
  onSave: (form: DoctorFormValues) => void;
  onClose: () => void;
}

function DoctorModal({ mode, initial, onSave, onClose }: DoctorModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<DoctorFormValues>(
    initial
      ? { ...initial, specialitiesRaw: initial.specialities.join(', ') }
      : EMPTY_FORM
  );

  const set = (field: keyof DoctorFormValues, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal open onClose={onClose} title={mode === 'create' ? t('doctors.new') : t('doctors.edit')}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('doctors.form.firstName')}
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
          <Input
            label={t('doctors.form.lastName')}
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
          />
          <div className="col-span-2">
            <Input
              label={t('doctors.form.specialities')}
              placeholder="Cardiología, Pediatría..."
              value={form.specialitiesRaw}
              onChange={(e) => set('specialitiesRaw', e.target.value)}
            />
          </div>
          <Input
            label={t('patients.table.email')}
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label={t('patients.table.phone')}
            value={form.phoneNumber}
            onChange={(e) => set('phoneNumber', e.target.value)}
          />
          <Input
            label={t('doctors.form.room')}
            value={form.room}
            onChange={(e) => set('room', e.target.value)}
          />
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

const STATUS_BADGE: Record<DoctorStatus, string> = {
  active: 'badge-moss',
  inactive: 'badge-muted',
};

const LICENSE_TYPE_LABEL: Record<string, string> = {
  mn: 'M.Nac.',
  mp: 'M.Prov.',
};

export default function Doctors() {
  const { t } = useApp();
  const navigate = useNavigate();
  const { openTab } = useWorkspaceTabs();

  const [list, setList] = useState<Doctor[]>(mockDoctors);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<Doctor | null>(null);

  const filtered = search
    ? list.filter(
        (d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          d.specialities.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : list;

  const openDoctor = (d: Doctor) => {
    const label = doctorLabel(d);
    openTab({ key: `doctor:${d.id}`, kind: 'doctor', label, path: `/doctors/${d.id}` });
    navigate(`/doctors/${d.id}`);
  };

  const handleSave = (form: DoctorFormValues) => {
    const specialities = form.specialitiesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (modalState?.mode === 'create') {
      setList((prev) => [
        ...prev,
        {
          ...form,
          id: `d-${Date.now()}`,
          specialities,
          licenses: [],
          status: 'active',
          nationalIdType: 'DNI',
          documentId: '',
          dateOfBirth: '',
          nationality: '',
          biologicalSex: 'm',
          gender: 'cisgenero',
          address: { street: '', city: '', state: '', country: '' },
        },
      ]);
    } else if (modalState?.mode === 'edit') {
      setList((prev) =>
        prev.map((d) =>
          d.id === modalState.data.id ? { ...d, ...form, specialities } : d
        )
      );
    }
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((d) => d.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const toggleStatus = (d: Doctor) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === d.id
          ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
          : item
      )
    );
  };

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: t('doctors.table.name'),
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-glacier/15 flex items-center justify-center shrink-0">
            <Stethoscope size={11} className="text-glacier" />
          </div>
          <span className="font-medium text-text text-sm">
            {doctorLabel(d)}
          </span>
        </div>
      ),
    },
    {
      key: 'specialities',
      header: t('doctors.table.speciality'),
      render: (d) => (
        <span className="text-sm text-muted">
          {d.specialities[0] ?? '—'}
          {d.specialities.length > 1 && (
            <span className="ml-1 text-2xs font-mono text-subtle">+{d.specialities.length - 1}</span>
          )}
        </span>
      ),
    },
    {
      key: 'licenses',
      header: t('doctors.table.license'),
      render: (d) =>
        d.licenses.length > 0 ? (
          <span className="font-mono text-xs text-muted">
            {LICENSE_TYPE_LABEL[d.licenses[0].licenseType]} {d.licenses[0].licenseId}
          </span>
        ) : (
          <span className="text-subtle text-xs">—</span>
        ),
    },
    { key: 'room', header: t('doctors.table.room'), className: 'font-mono text-muted' },
    {
      key: 'status',
      header: t('doctors.table.status'),
      render: (d) => (
        <span className={clsx(STATUS_BADGE[d.status], 'text-xs')}>
          {t(`doctors.statusOptions.${d.status}`)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-28',
      render: (d) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              navigate('/appointments');
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('doctors.viewAvailability')}
          >
            <Calendar size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              const label = doctorLabel(d);
              openTab({ key: `doctor:${d.id}`, kind: 'doctor', label, path: `/doctors/${d.id}` });
              navigate(`/doctors/${d.id}?tab=appointments`);
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('doctors.viewAppointments')}
          >
            <CalendarClock size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModalState({ mode: 'edit', data: d });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('doctors.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              toggleStatus(d);
            }}
            className={clsx(
              'p-1.5 rounded transition-colors',
              d.status === 'active'
                ? 'text-muted hover:text-sienna hover:bg-sienna/10'
                : 'text-muted hover:text-moss hover:bg-moss/10'
            )}
            title={d.status === 'active' ? t('doctors.deactivate') : t('doctors.activate')}
          >
            <Power size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setConfirmDelete(d);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('doctors.delete')}
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
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={() => setModalState({ mode: 'create' })}>
          {t('doctors.new')}
        </Button>
        <div className="flex-1 min-w-[200px]" />
        <div className="flex items-center gap-2 bg-surface border border-border rounded px-3 py-1.5">
          <Search size={13} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('doctors.searchPlaceholder')}
            className="text-sm font-mono text-text bg-transparent outline-none w-48"
          />
        </div>
      </div>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.id}
        onRowClick={openDoctor}
        emptyMessage={search ? t('common.noResults') : t('doctors.empty')}
      />

      {modalState && (
        <DoctorModal
          mode={modalState.mode}
          initial={modalState.mode === 'edit' ? modalState.data : undefined}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title={t('doctors.delete')}
        message={t('doctors.deleteConfirm', {
          name: confirmDelete ? `${confirmDelete.firstName} ${confirmDelete.lastName}` : '',
        })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
