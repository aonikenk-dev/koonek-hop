import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { prescriptions as mockPrescriptions, type Prescription } from '@/data/mock/prescriptions';
import { patients } from '@/data/mock/patients';
import PrescriptionList from '@/components/prescriptions/PrescriptionList';
import PrescriptionModal, { type PrescriptionFormValues } from '@/components/prescriptions/PrescriptionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Prescription } | null;

export default function Prescriptions() {
  const { t } = useApp();
  const { user } = useAuth();
  const [list, setList] = useState<Prescription[]>(mockPrescriptions);
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<Prescription | null>(null);

  const filtered = search
    ? list.filter((p) => p.patientName.toLowerCase().includes(search.toLowerCase()))
    : list;

  const handleSave = (form: PrescriptionFormValues) => {
    if (modalState?.mode === 'edit') {
      setList((prev) => prev.map((p) => (p.id === modalState.data.id ? { ...p, ...form } : p)));
      setModalState(null);
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient) return;
    setList((prev) => [
      {
        id: `rx-${Date.now()}`,
        patientId: form.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: user ? `${user.firstName} ${user.lastName}` : '',
        date: new Date().toISOString().slice(0, 10),
        diagnosis: form.diagnosis,
        items: form.items,
        notes: form.notes,
        frequent: form.frequent,
        requiresDuplicate: form.requiresDuplicate,
        longTerm: form.longTerm,
      },
      ...prev,
    ]);
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setList((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={() => setModalState({ mode: 'create' })}>
          {t('prescriptions.new')}
        </Button>
        <div className="flex-1 min-w-[200px]" />
        <div className="flex items-center gap-2 bg-surface border border-border rounded px-3 py-1.5">
          <Search size={13} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('prescriptions.searchPlaceholder')}
            className="text-sm font-mono text-text bg-transparent outline-none w-48"
          />
        </div>
      </div>

      <PrescriptionList
        prescriptions={filtered}
        onDelete={setConfirmDelete}
        onRowClick={(p) => setModalState({ mode: 'edit', data: p })}
        emptyMessage={search ? t('common.noResults') : t('prescriptions.empty')}
      />

      <PrescriptionModal
        open={!!modalState}
        onClose={() => setModalState(null)}
        onSave={handleSave}
        initial={modalState?.mode === 'edit' ? modalState.data : undefined}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title={t('prescriptions.delete')}
        message={t('prescriptions.deleteConfirm', { name: confirmDelete?.patientName ?? '', date: confirmDelete?.date ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
