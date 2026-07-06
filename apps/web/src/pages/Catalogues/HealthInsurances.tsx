import { useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Plus, Search, Pencil, Trash2, ShieldCheck, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { healthInsurances as mockData, type HealthInsurance } from '@/data/mock/catalogues';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type HiForm = { code: string; description: string };
const EMPTY: HiForm = { code: '', description: '' };
type ModalState = { mode: 'create' } | { mode: 'edit'; data: HealthInsurance } | null;

interface HiModalProps {
  mode: 'create' | 'edit';
  initial?: HealthInsurance;
  onSave: (form: HiForm, plans: string[]) => void;
  onClose: () => void;
}

function HiModal({ mode, initial, onSave, onClose }: HiModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<HiForm>(
    initial ? { code: initial.code, description: initial.description } : { ...EMPTY }
  );
  const [plans, setPlans] = useState<string[]>(initial?.plans.map((p) => p.code) ?? []);
  const [newPlan, setNewPlan] = useState('');

  const addPlan = () => {
    const code = newPlan.trim().toUpperCase();
    if (!code) return;
    setPlans((p) => [...p, code]);
    setNewPlan('');
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t(mode === 'create' ? 'catalogues.healthInsurances.new' : 'catalogues.healthInsurances.edit')}
      size="lg"
    >
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(form, plans);
        }}
        className="p-5 space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('catalogues.healthInsurances.form.code')}
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          <Input
            label={t('catalogues.healthInsurances.form.description')}
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <p className="text-2xs font-mono text-muted uppercase tracking-widest mb-2">
            {t('catalogues.healthInsurances.form.plans')}
          </p>
          {plans.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {plans.map((code, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-surface-2 border border-border rounded px-2 py-0.5 font-mono text-xs text-text"
                >
                  {code}
                  <button
                    type="button"
                    onClick={() => setPlans((p) => p.filter((_, j) => j !== i))}
                    className="text-muted hover:text-sienna transition-colors ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value.toUpperCase())}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPlan();
                }
              }}
              placeholder={t('catalogues.healthInsurances.form.planCode')}
              className="input flex-1 text-sm h-8 font-mono"
            />
            <Button type="button" variant="ghost" className="text-xs h-8 shrink-0" onClick={addPlan}>
              <Plus size={12} className="mr-1" />
              {t('catalogues.healthInsurances.form.addPlan')}
            </Button>
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

export default function HealthInsurances() {
  const { t } = useApp();
  const [list, setList] = useState<HealthInsurance[]>(mockData);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<HealthInsurance | null>(null);

  const filtered = search
    ? list.filter(
        (h) =>
          h.code.toLowerCase().includes(search.toLowerCase()) ||
          h.description.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const handleSave = (form: HiForm, planCodes: string[]) => {
    const plans = planCodes.map((code) => ({ code }));
    if (modal?.mode === 'edit') {
      setList((l) => l.map((h) => (h.id === modal.data.id ? { ...h, ...form, plans } : h)));
    } else {
      setList((l) => [...l, { ...form, id: `hi-${Date.now()}`, plans }]);
    }
    setModal(null);
  };

  const columns: Column<HealthInsurance>[] = [
    {
      key: 'code',
      header: t('catalogues.healthInsurances.table.code'),
      render: (h) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-glacier/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={11} className="text-glacier" />
          </div>
          <span className="font-mono font-medium text-text text-sm">{h.code}</span>
        </div>
      ),
    },
    { key: 'description', header: t('catalogues.healthInsurances.table.description'), className: 'text-muted' },
    {
      key: 'plans',
      header: t('catalogues.healthInsurances.table.plans'),
      render: (h) =>
        h.plans.length === 0 ? (
          <span className="text-muted text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {h.plans.map((p) => (
              <span key={p.code} className="badge-muted font-mono text-2xs">
                {p.code}
              </span>
            ))}
          </div>
        ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (h) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModal({ mode: 'edit', data: h });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('catalogues.healthInsurances.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setToDelete(h);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('catalogues.healthInsurances.delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('catalogues.healthInsurances.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="ml-auto text-xs h-9">
          <Plus size={14} className="mr-1 shrink-0" />
          {t('catalogues.healthInsurances.new')}
        </Button>
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(h) => h.id}
        onRowClick={(h) => setModal({ mode: 'edit', data: h })}
        emptyMessage={t('catalogues.healthInsurances.empty')}
      />
      {modal && (
        <HiModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmModal
        open={!!toDelete}
        message={t('catalogues.healthInsurances.deleteConfirm', { name: toDelete?.description ?? '' })}
        onConfirm={() => {
          if (toDelete) setList((l) => l.filter((h) => h.id !== toDelete.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
