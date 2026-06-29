import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Paperclip, X, FlaskConical } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { fetchLaboratoriesByPatientId } from '@/services/laboratories';
import { LABORATORY_TYPES, type LabExam, type LabItem, type LabFile } from '@/data/mock/laboratories';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import ConfirmModal from '@/components/ui/ConfirmModal';

const EMPTY_ITEM: LabItem = { laboratoryType: LABORATORY_TYPES[0], value: '' };

interface LabForm {
  date: string;
  items: LabItem[];
  files: LabFile[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; data: LabExam } | null;

function buildForm(source?: LabExam): LabForm {
  return source
    ? { date: source.date, items: source.items, files: source.files }
    : { date: new Date().toISOString().slice(0, 10), items: [{ ...EMPTY_ITEM }], files: [] };
}

export default function LaboratoriesTab({ patientId }: { patientId: string }) {
  const { t } = useApp();
  const [addedItems, setAddedItems] = useState<LabExam[]>([]);
  const [overrides, setOverrides] = useState<Record<string, LabExam>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(null);
  const [form, setForm] = useState<LabForm>(() => buildForm());
  const [confirmDelete, setConfirmDelete] = useState<LabExam | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patientLaboratories', patientId],
    queryFn: () => fetchLaboratoriesByPatientId(patientId),
  });

  const combined = [...addedItems, ...(data ?? [])]
    .map((l) => overrides[l.id] ?? l)
    .filter((l) => !deletedIds.has(l.id));

  const openCreate = () => {
    setForm(buildForm());
    setModalState({ mode: 'create' });
  };
  const openEdit = (l: LabExam) => {
    setForm(buildForm(l));
    setModalState({ mode: 'edit', data: l });
  };

  const setItem = (i: number, field: keyof LabItem, value: string) =>
    setForm((f) => ({ ...f, items: f.items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setForm((f) => ({
      ...f,
      files: [
        ...f.files,
        ...picked.map((file) => ({
          id: `f-${Date.now()}-${file.name}`,
          name: file.name,
          uploadedDate: new Date().toISOString().slice(0, 10),
          url: URL.createObjectURL(file),
        })),
      ],
    }));
    e.target.value = '';
  };

  const removeFile = (id: string) => setForm((f) => ({ ...f, files: f.files.filter((file) => file.id !== id) }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const items = form.items.filter((i) => i.value.trim());
    if (modalState?.mode === 'edit') {
      setOverrides((prev) => ({ ...prev, [modalState.data.id]: { ...modalState.data, date: form.date, items, files: form.files } }));
    } else {
      setAddedItems((prev) => [{ id: `lab-${Date.now()}`, patientId, date: form.date, items, files: form.files }, ...prev]);
    }
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setDeletedIds((prev) => new Set(prev).add(confirmDelete.id));
    setConfirmDelete(null);
  };

  const columns: Column<LabExam>[] = [
    { key: 'date', header: t('laboratories.table.date'), className: 'font-mono text-muted' },
    {
      key: 'items',
      header: t('laboratories.table.items'),
      render: (l) => (
        <div className="flex items-center gap-2">
          <FlaskConical size={13} className="text-glacier shrink-0" />
          <span className="text-muted">{l.items.map((i) => i.laboratoryType).join(', ')}</span>
        </div>
      ),
    },
    {
      key: 'files',
      header: t('laboratories.table.files'),
      render: (l) => (
        <span className="flex items-center gap-1.5 text-muted">
          <Paperclip size={12} /> {l.files.length}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-12',
      render: (l) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(l);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
            title={t('laboratories.delete')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.laboratories')}</p>

      <div className="flex justify-end">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={openCreate}>
          {t('laboratories.new')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <Table columns={columns} rows={combined} rowKey={(l) => l.id} onRowClick={openEdit} emptyMessage={t('laboratories.empty')} />
      )}

      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? t('laboratories.edit') : t('laboratories.new')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            type="date"
            label={t('appointments.form.date')}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />

          <div className="space-y-3">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div className="space-y-1.5">
                  <label className="text-2xs font-mono text-muted uppercase tracking-wide">
                    {t('laboratories.form.type')}
                  </label>
                  <select
                    value={item.laboratoryType}
                    onChange={(e) => setItem(i, 'laboratoryType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
                  >
                    {LABORATORY_TYPES.map((lt) => (
                      <option key={lt} value={lt}>
                        {lt}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t('laboratories.form.value')}
                  value={item.value}
                  onChange={(e) => setItem(i, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={form.items.length === 1}
                  className="p-2.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 disabled:opacity-30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button type="button" variant="ghost" leftIcon={<Plus size={13} />} className="text-xs" onClick={addItem}>
              {t('laboratories.form.addItem')}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('laboratories.form.files')}</label>
            <div className="flex flex-wrap gap-1.5">
              {form.files.map((file) =>
                file.url ? (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="badge-glacier text-xs hover:underline"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFile(file.id);
                      }}
                      className="ml-1.5"
                    >
                      <X size={10} />
                    </button>
                  </a>
                ) : (
                  <span key={file.id} className="badge-muted text-xs" title={t('laboratories.form.noPreview')}>
                    {file.name}
                    <button type="button" onClick={() => removeFile(file.id)} className="ml-1.5">
                      <X size={10} />
                    </button>
                  </span>
                )
              )}
            </div>
            <label className="btn-secondary text-xs cursor-pointer inline-flex">
              <Paperclip size={13} />
              {t('laboratories.form.attachFile')}
              <input type="file" multiple onChange={handleFilePick} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setModalState(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="text-xs">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        title={t('laboratories.delete')}
        message={t('laboratories.deleteConfirm', { date: confirmDelete?.date ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
