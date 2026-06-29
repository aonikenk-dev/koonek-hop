import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { patients } from '@/data/mock/patients';
import type { Prescription, PrescriptionItem } from '@/data/mock/prescriptions';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';

export interface PrescriptionFormValues {
  patientId: string;
  diagnosis: string;
  items: PrescriptionItem[];
  notes: string;
  frequent: boolean;
  requiresDuplicate: boolean;
  longTerm: boolean;
}

const EMPTY_ITEM: PrescriptionItem = { drug: '', dosage: '', frequency: '' };

interface PrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: PrescriptionFormValues) => void;
  /** When set, the patient is fixed (e.g. opened from the patient's own Recetas tab). */
  lockedPatientId?: string;
  /** When set, the modal opens pre-filled for editing instead of creating. */
  initial?: Prescription;
}

export default function PrescriptionModal({ open, onClose, onSave, lockedPatientId, initial }: PrescriptionModalProps) {
  const { t } = useApp();
  const [patientId, setPatientId] = useState(lockedPatientId ?? patients[0]?.id ?? '');
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState('');
  const [frequent, setFrequent] = useState(false);
  const [requiresDuplicate, setRequiresDuplicate] = useState(false);
  const [longTerm, setLongTerm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setPatientId(initial.patientId);
      setDiagnosis(initial.diagnosis);
      setItems(initial.items.length ? initial.items : [{ ...EMPTY_ITEM }]);
      setNotes(initial.notes ?? '');
      setFrequent(initial.frequent);
      setRequiresDuplicate(initial.requiresDuplicate);
      setLongTerm(initial.longTerm);
    } else {
      setPatientId(lockedPatientId ?? patients[0]?.id ?? '');
      setDiagnosis('');
      setItems([{ ...EMPTY_ITEM }]);
      setNotes('');
      setFrequent(false);
      setRequiresDuplicate(false);
      setLongTerm(false);
    }
  }, [open, initial, lockedPatientId]);

  const setItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.drug.trim());
    if (validItems.length === 0) return;
    onSave({ patientId, diagnosis, items: validItems, notes, frequent, requiresDuplicate, longTerm });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('prescriptions.edit') : t('prescriptions.new')} size="lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {!lockedPatientId && (
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">
              {t('prescriptions.form.patient')}
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label={t('prescriptions.form.diagnosis')}
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <Input
                label={t('prescriptions.form.drug')}
                value={item.drug}
                onChange={(e) => setItem(i, 'drug', e.target.value)}
              />
              <Input
                label={t('prescriptions.form.dosage')}
                value={item.dosage}
                onChange={(e) => setItem(i, 'dosage', e.target.value)}
              />
              <Input
                label={t('prescriptions.form.frequency')}
                value={item.frequency}
                onChange={(e) => setItem(i, 'frequency', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                title={t('prescriptions.form.removeItem')}
                className="p-2.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" leftIcon={<Plus size={13} />} className="text-xs" onClick={addItem}>
            {t('prescriptions.form.addItem')}
          </Button>
        </div>

        <div className="space-y-1.5">
          <label className="text-2xs font-mono text-muted uppercase tracking-wide">
            {t('prescriptions.form.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20"
          />
        </div>

        <div className="flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <Toggle checked={frequent} onChange={setFrequent} />
            {t('prescriptions.form.frequent')}
          </label>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <Toggle checked={longTerm} onChange={setLongTerm} />
            {t('prescriptions.form.longTerm')}
          </label>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <Toggle checked={requiresDuplicate} onChange={setRequiresDuplicate} />
            {t('prescriptions.form.requiresDuplicate')}
          </label>
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
