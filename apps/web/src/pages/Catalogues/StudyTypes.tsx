import { useState, type FormEvent, type MouseEvent } from 'react';
import { Plus, Search, Pencil, Trash2, Microscope } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { studyTypes as mockData, type StudyType } from '@/data/mock/catalogues';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type StudyTypeForm = Pick<StudyType, 'code' | 'description'>;
const EMPTY: StudyTypeForm = { code: '', description: '' };
type ModalState = { mode: 'create' } | { mode: 'edit'; data: StudyType } | null;

interface StudyTypeModalProps {
  mode: 'create' | 'edit';
  initial?: StudyType;
  onSave: (form: StudyTypeForm) => void;
  onClose: () => void;
}

function StudyTypeModal({ mode, initial, onSave, onClose }: StudyTypeModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<StudyTypeForm>(
    initial ? { code: initial.code, description: initial.description } : { ...EMPTY }
  );

  return (
    <Modal open onClose={onClose} title={t(mode === 'create' ? 'catalogues.studyTypes.new' : 'catalogues.studyTypes.edit')}>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(form);
        }}
        className="p-5 space-y-4"
      >
        <Input
          label={t('catalogues.studyTypes.form.code')}
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
        />
        <Input
          label={t('catalogues.studyTypes.form.description')}
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

export default function StudyTypes() {
  const { t } = useApp();
  const [list, setList] = useState<StudyType[]>(mockData);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<StudyType | null>(null);

  const filtered = search
    ? list.filter(
        (s) =>
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const handleSave = (form: StudyTypeForm) => {
    if (modal?.mode === 'edit') {
      setList((l) => l.map((s) => (s.id === modal.data.id ? { ...s, ...form } : s)));
    } else {
      setList((l) => [...l, { ...form, id: `st-${Date.now()}` }]);
    }
    setModal(null);
  };

  const columns: Column<StudyType>[] = [
    {
      key: 'code',
      header: t('catalogues.studyTypes.table.code'),
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <Microscope size={11} className="text-moss" />
          </div>
          <span className="font-mono font-medium text-text text-sm">{s.code}</span>
        </div>
      ),
    },
    { key: 'description', header: t('catalogues.studyTypes.table.description'), className: 'text-muted' },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (s) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModal({ mode: 'edit', data: s });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('catalogues.studyTypes.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setToDelete(s);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('catalogues.studyTypes.delete')}
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
            placeholder={t('catalogues.studyTypes.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="ml-auto text-xs h-9">
          <Plus size={14} className="mr-1 shrink-0" />
          {t('catalogues.studyTypes.new')}
        </Button>
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(s) => s.id}
        onRowClick={(s) => setModal({ mode: 'edit', data: s })}
        emptyMessage={t('catalogues.studyTypes.empty')}
      />
      {modal && (
        <StudyTypeModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmModal
        open={!!toDelete}
        message={t('catalogues.studyTypes.deleteConfirm', { name: toDelete?.description ?? '' })}
        onConfirm={() => {
          if (toDelete) setList((l) => l.filter((s) => s.id !== toDelete.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
