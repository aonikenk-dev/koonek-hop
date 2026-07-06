import { useState, type FormEvent, type MouseEvent } from 'react';
import { Plus, Search, Pencil, Trash2, Tag as TagIcon } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { tags as mockData, type Tag } from '@/data/mock/catalogues';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { type Column } from '@/components/ui/Table';

type TagForm = Pick<Tag, 'name'>;
const EMPTY: TagForm = { name: '' };
type ModalState = { mode: 'create' } | { mode: 'edit'; data: Tag } | null;

interface TagModalProps {
  mode: 'create' | 'edit';
  initial?: Tag;
  onSave: (form: TagForm) => void;
  onClose: () => void;
}

function TagModal({ mode, initial, onSave, onClose }: TagModalProps) {
  const { t } = useApp();
  const [form, setForm] = useState<TagForm>(initial ? { name: initial.name } : { ...EMPTY });

  return (
    <Modal open onClose={onClose} title={t(mode === 'create' ? 'catalogues.tags.new' : 'catalogues.tags.edit')} size="sm">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(form);
        }}
        className="p-5 space-y-4"
      >
        <Input
          label={t('catalogues.tags.form.name')}
          required
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
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

export default function Tags() {
  const { t } = useApp();
  const [list, setList] = useState<Tag[]>(mockData);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<Tag | null>(null);

  const filtered = search
    ? list.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
    : list;

  const handleSave = (form: TagForm) => {
    if (modal?.mode === 'edit') {
      setList((l) => l.map((tag) => (tag.id === modal.data.id ? { ...tag, ...form } : tag)));
    } else {
      setList((l) => [...l, { ...form, id: `tag-${Date.now()}` }]);
    }
    setModal(null);
  };

  const columns: Column<Tag>[] = [
    {
      key: 'name',
      header: t('catalogues.tags.table.name'),
      render: (tag) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-moss/10 flex items-center justify-center shrink-0">
            <TagIcon size={11} className="text-moss" />
          </div>
          <span className="font-medium text-text text-sm">{tag.name}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-20',
      render: (tag) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setModal({ mode: 'edit', data: tag });
            }}
            className="p-1.5 rounded text-muted hover:text-moss hover:bg-moss/10 transition-colors"
            title={t('catalogues.tags.edit')}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setToDelete(tag);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('catalogues.tags.delete')}
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
            placeholder={t('catalogues.tags.searchPlaceholder')}
            className="input pl-8 w-full text-sm h-9"
          />
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="ml-auto text-xs h-9">
          <Plus size={14} className="mr-1 shrink-0" />
          {t('catalogues.tags.new')}
        </Button>
      </div>
      <Table
        columns={columns}
        rows={filtered}
        rowKey={(tag) => tag.id}
        onRowClick={(tag) => setModal({ mode: 'edit', data: tag })}
        emptyMessage={t('catalogues.tags.empty')}
      />
      {modal && (
        <TagModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <ConfirmModal
        open={!!toDelete}
        message={t('catalogues.tags.deleteConfirm', { name: toDelete?.name ?? '' })}
        onConfirm={() => {
          if (toDelete) setList((l) => l.filter((tag) => tag.id !== toDelete.id));
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
