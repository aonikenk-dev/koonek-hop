import { useState, type FormEvent, type MouseEvent } from 'react';
import { Plus, Search, Pencil, Trash2, Pill, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { drugs as mockDrugs, type Drug } from '@/data/mock/catalogues';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import Table, { type Column } from '@/components/ui/Table';

type DrugForm = {
  drugName: string;
  description: string;
  composition: string;
  format: string;
  requiresPrescription: boolean;
};

const EMPTY: DrugForm = { drugName: '', description: '', composition: '', format: '', requiresPrescription: false };

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Drug } | null;

interface DrugModalProps {
  mode: 'create' | 'edit';
  initial?: Drug;
  onSave: (form: DrugForm) => void;
  onClose: () => void;
}

function DrugModal({ mode, initial, onSave, onClose }: DrugModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<DrugForm>(
    initial
      ? {
          drugName: initial.drugName,
          description: initial.description,
          composition: initial.composition ?? '',
          format: initial.format ?? '',
          requiresPrescription: initial.requiresPrescription,
        }
      : { ...EMPTY }
  );
  const set = (k: keyof DrugForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal open onClose={onClose} title={t(mode === 'create' ? 'catalogues.drugs.new' : 'catalogues.drugs.edit')}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(form);
        }}
        className="p-5 space-y-4"
      >
        <Input
          label={t('catalogues.drugs.form.drugName')}
          required
          value={form.drugName}
          onChange={(e) => set('drugName', e.target.value)}
        />
        <Input
          label={t('catalogues.drugs.form.description')}
          required
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('catalogues.drugs.form.composition')}
            value={form.composition}
            onChange={(e) => set('composition', e.target.value)}
          />
          <Input
            label={t('catalogues.drugs.form.format')}
            value={form.format}
            onChange={(e) => set('format', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={form.requiresPrescription} onChange={(v) => set('requiresPrescription', v)} />
          <span className="text-sm text-text">{t('catalogues.drugs.form.requiresPrescription')}</span>
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

export default function Drugs() {
  const { t } = useApp();
  const [list, setList] = useState<Drug[]>(mockDrugs);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Drug | null>(null);

  const filtered = search
    ? list.filter(
        (d) =>
          d.drugName.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const handleSave = (form: DrugForm) => {
    if (modal?.mode === 'edit') {
      setList((l) => l.map((d) => (d.id === modal.data.id ? { ...d, ...form } : d)));
    } else {
      setList((l) => [...l, { ...form, id: `drug-${Date.now()}` }]);
    }
    setModal(null);
  };

  const columns: Column<Drug>[] = [
    {
      key: 'drugName',
      header: t('catalogues.drugs.table.drugName'),
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <Pill size={11} className="text-moss" />
          </div>
          <span className="font-medium text-text text-sm">{d.drugName}</span>
        </div>
      ),
    },
    { key: 'description', header: t('catalogues.drugs.table.description'), className: 'text-muted' },
    { key: 'composition', header: t('catalogues.drugs.table.composition'), className: 'font-mono text-muted text-xs' },
    { key: 'format', header: t('catalogues.drugs.table.format'), className: 'text-muted text-xs' },
    {
      key: 'requiresPrescription',
      header: t('catalogues.drugs.table.requiresPrescription'),
      className: 'text-center',
      render: (d) => (d.requiresPrescription ? <Check size={14} className="text-moss mx-auto" /> : null),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (d) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModal({ mode: 'edit', data: d });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('catalogues.drugs.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setToDelete(d);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('catalogues.drugs.delete')}
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
            placeholder={t('catalogues.drugs.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setModal({ mode: 'create' })} className="ml-auto text-xs h-9">
          {t('catalogues.drugs.new')}
        </Button>
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.id}
        onRowClick={(d) => setModal({ mode: 'edit', data: d })}
        emptyMessage={t('catalogues.drugs.empty')}
      />
      {modal && (
        <DrugModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmModal
        open={!!toDelete}
        message={t('catalogues.drugs.deleteConfirm', { name: toDelete?.drugName ?? '' })}
        onConfirm={() => {
          if (toDelete) setList((l) => l.filter((d) => d.id !== toDelete.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
