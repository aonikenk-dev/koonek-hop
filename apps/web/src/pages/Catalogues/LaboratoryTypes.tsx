import { useState, type FormEvent, type MouseEvent } from 'react';
import { Plus, Search, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { laboratoryTypes as mockData, type LaboratoryType } from '@/data/mock/catalogues';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type LabTypeForm = Pick<LaboratoryType, 'code' | 'description'>;
const EMPTY: LabTypeForm = { code: '', description: '' };
type ModalState = { mode: 'create' } | { mode: 'edit'; data: LaboratoryType } | null;

interface LabTypeModalProps {
  mode: 'create' | 'edit';
  initial?: LaboratoryType;
  onSave: (form: LabTypeForm) => void;
  onClose: () => void;
}

function LabTypeModal({ mode, initial, onSave, onClose }: LabTypeModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<LabTypeForm>(
    initial ? { code: initial.code, description: initial.description } : { ...EMPTY }
  );

  return (
    <Modal open onClose={onClose} title={t(mode === 'create' ? 'catalogues.laboratoryTypes.new' : 'catalogues.laboratoryTypes.edit')}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(form);
        }}
        className="p-5 space-y-4"
      >
        <Input
          label={t('catalogues.laboratoryTypes.form.code')}
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
        />
        <Input
          label={t('catalogues.laboratoryTypes.form.description')}
          required
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
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

export default function LaboratoryTypes() {
  const { t } = useApp();
  const [list, setList] = useState<LaboratoryType[]>(mockData);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<LaboratoryType | null>(null);

  const filtered = search
    ? list.filter(
        (l) =>
          l.code.toLowerCase().includes(search.toLowerCase()) ||
          l.description.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const handleSave = (form: LabTypeForm) => {
    if (modal?.mode === 'edit') {
      setList((l) => l.map((lt) => (lt.id === modal.data.id ? { ...lt, ...form } : lt)));
    } else {
      setList((l) => [...l, { ...form, id: `lt-${Date.now()}` }]);
    }
    setModal(null);
  };

  const columns: Column<LaboratoryType>[] = [
    {
      key: 'code',
      header: t('catalogues.laboratoryTypes.table.code'),
      render: (lt) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <FlaskConical size={11} className="text-moss" />
          </div>
          <span className="font-mono font-medium text-text text-sm">{lt.code}</span>
        </div>
      ),
    },
    { key: 'description', header: t('catalogues.laboratoryTypes.table.description'), className: 'text-muted' },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (lt) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModal({ mode: 'edit', data: lt });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('catalogues.laboratoryTypes.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setToDelete(lt);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('catalogues.laboratoryTypes.delete')}
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
            placeholder={t('catalogues.laboratoryTypes.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="ml-auto text-xs h-9">
          <Plus size={14} className="mr-1 shrink-0" />
          {t('catalogues.laboratoryTypes.new')}
        </Button>
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(lt) => lt.id}
        onRowClick={(lt) => setModal({ mode: 'edit', data: lt })}
        emptyMessage={t('catalogues.laboratoryTypes.empty')}
      />
      {modal && (
        <LabTypeModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmModal
        open={!!toDelete}
        message={t('catalogues.laboratoryTypes.deleteConfirm', { name: toDelete?.description ?? '' })}
        onConfirm={() => {
          if (toDelete) setList((l) => l.filter((lt) => lt.id !== toDelete.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
