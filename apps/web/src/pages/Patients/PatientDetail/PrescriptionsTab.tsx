import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPrescriptionsByPatientId } from '@/services/prescriptions';
import PrescriptionList from '@/components/prescriptions/PrescriptionList';
import PrescriptionModal, { type PrescriptionFormValues } from '@/components/prescriptions/PrescriptionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import type { Prescription } from '@/data/mock/prescriptions';

interface PrescriptionsTabProps {
  patientId: string;
  patientName: string;
}

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Prescription } | null;

export default function PrescriptionsTab({ patientId, patientName }: PrescriptionsTabProps) {
  const { t } = useApp();
  const { user } = useAuth();
  const [addedItems, setAddedItems] = useState<Prescription[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Prescription>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<Prescription | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patientPrescriptions', patientId],
    queryFn: () => fetchPrescriptionsByPatientId(patientId),
  });

  const combined = [...addedItems, ...(data ?? [])]
    .map((p) => overrides[p.id] ?? p)
    .filter((p) => !deletedIds.has(p.id));

  const handleSave = (form: PrescriptionFormValues) => {
    if (modalState?.mode === 'edit') {
      setOverrides((prev) => ({ ...prev, [modalState.data.id]: { ...modalState.data, ...form } }));
      setModalState(null);
      return;
    }
    setAddedItems((prev) => [
      {
        id: `rx-${Date.now()}`,
        patientId,
        patientName,
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
    setDeletedIds((prev) => new Set(prev).add(confirmDelete.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.prescriptions')}</p>

      <div className="flex justify-end">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={() => setModalState({ mode: 'create' })}>
          {t('prescriptions.new')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <PrescriptionList
          prescriptions={combined}
          showPatientColumn={false}
          onDelete={setConfirmDelete}
          onRowClick={(p) => setModalState({ mode: 'edit', data: p })}
        />
      )}

      <PrescriptionModal
        open={!!modalState}
        onClose={() => setModalState(null)}
        onSave={handleSave}
        lockedPatientId={patientId}
        initial={modalState?.mode === 'edit' ? modalState.data : undefined}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title={t('prescriptions.delete')}
        message={t('prescriptions.deleteConfirm', { name: patientName, date: confirmDelete?.date ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
