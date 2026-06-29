import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Paperclip, ExternalLink, FileText, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '@/contexts/AppContext';
import { fetchStudiesByPatientId } from '@/services/studies';
import { fetchFilesByPatientId } from '@/services/patientFiles';
import { STUDY_TYPES, type Study, type StudyFile } from '@/data/mock/studies';
import type { PatientFile } from '@/data/mock/patientFiles';
import Section from '@/components/ui/Section';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface StudyForm {
  date: string;
  studyType: string;
  link: string;
  files: StudyFile[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; data: Study } | null;

function buildStudyForm(source?: Study): StudyForm {
  return source
    ? { date: source.date, studyType: source.studyType, link: source.link ?? '', files: source.files }
    : { date: new Date().toISOString().slice(0, 10), studyType: STUDY_TYPES[0], link: '', files: [] };
}

function StudiesSection({ patientId }: { patientId: string }) {
  const { t } = useApp();
  const [addedItems, setAddedItems] = useState<Study[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Study>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>(null);
  const [form, setForm] = useState<StudyForm>(() => buildStudyForm());
  const [confirmDelete, setConfirmDelete] = useState<Study | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patientStudies', patientId],
    queryFn: () => fetchStudiesByPatientId(patientId),
  });

  const combined = [...addedItems, ...(data ?? [])]
    .map((s) => overrides[s.id] ?? s)
    .filter((s) => !deletedIds.has(s.id));

  const openCreate = () => {
    setForm(buildStudyForm());
    setModalState({ mode: 'create' });
  };
  const openEdit = (s: Study) => {
    setForm(buildStudyForm(s));
    setModalState({ mode: 'edit', data: s });
  };

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setForm((f) => ({
      ...f,
      files: [
        ...f.files,
        ...picked.map((file) => ({
          id: `stf-${Date.now()}-${file.name}`,
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
    if (!form.link.trim() && form.files.length === 0) return;
    if (modalState?.mode === 'edit') {
      setOverrides((prev) => ({
        ...prev,
        [modalState.data.id]: { ...modalState.data, date: form.date, studyType: form.studyType, link: form.link || undefined, files: form.files },
      }));
    } else {
      setAddedItems((prev) => [
        { id: `st-${Date.now()}`, patientId, date: form.date, studyType: form.studyType, link: form.link || undefined, files: form.files },
        ...prev,
      ]);
    }
    setModalState(null);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setDeletedIds((prev) => new Set(prev).add(confirmDelete.id));
    setConfirmDelete(null);
  };

  const columns: Column<Study>[] = [
    { key: 'date', header: t('appointments.form.date'), className: 'font-mono text-muted' },
    { key: 'studyType', header: t('studies.form.type') },
    {
      key: 'link',
      header: t('studies.form.link'),
      render: (s) =>
        s.link ? (
          <a
            href={s.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-glacier hover:underline"
          >
            <ExternalLink size={12} /> {t('studies.viewExternal')}
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'files',
      header: t('laboratories.table.files'),
      render: (s) => (
        <span className="flex items-center gap-1.5 text-muted">
          <Paperclip size={12} /> {s.files.length}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      className: 'text-center w-12',
      render: (s) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(s);
            }}
            className="p-1.5 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Section title={t('studies.sectionTitle')}>
      <p className="text-sm text-muted">{t('studies.description')}</p>
      <div className="flex justify-end">
        <Button leftIcon={<Plus size={14} />} className="text-xs" onClick={openCreate}>
          {t('studies.new')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <Table columns={columns} rows={combined} rowKey={(s) => s.id} onRowClick={openEdit} emptyMessage={t('studies.empty')} />
      )}

      <Modal
        open={!!modalState}
        onClose={() => setModalState(null)}
        title={modalState?.mode === 'edit' ? t('studies.edit') : t('studies.new')}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-2xs font-mono text-muted uppercase tracking-wide">{t('studies.form.type')}</label>
            <select
              value={form.studyType}
              onChange={(e) => setForm((f) => ({ ...f, studyType: e.target.value }))}
              className="w-full px-3 py-2.5 rounded border border-border bg-surface font-mono text-sm text-text outline-none focus:border-moss"
            >
              {STUDY_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <Input
            type="date"
            label={t('appointments.form.date')}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <Input
            label={t('studies.form.link')}
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder="https://..."
          />
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
        title={t('studies.delete')}
        message={t('studies.deleteConfirm', { date: confirmDelete?.date ?? '' })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Section>
  );
}

function FilesSection({ patientId }: { patientId: string }) {
  const { t } = useApp();
  const [addedFiles, setAddedFiles] = useState<PatientFile[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['patientFiles', patientId],
    queryFn: () => fetchFilesByPatientId(patientId),
  });

  const combined = [...addedFiles, ...(data ?? [])].filter((f) => !deletedIds.has(f.id));

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAddedFiles((prev) => [
      { id: `pf-${Date.now()}`, patientId, name: file.name, uploadedDate: new Date().toISOString().slice(0, 10), url: URL.createObjectURL(file) },
      ...prev,
    ]);
    e.target.value = '';
  };

  return (
    <Section title={t('patientFiles.sectionTitle')}>
      <p className="text-sm text-muted">{t('patientFiles.description')}</p>

      <label className="btn-secondary text-xs cursor-pointer inline-flex">
        <Paperclip size={13} />
        {t('patientFiles.addFile')}
        <input type="file" onChange={handlePick} className="hidden" />
      </label>

      {isLoading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : combined.length === 0 ? (
        <div className="kpi-card flex items-center justify-center py-8 text-sm text-muted">{t('patientFiles.empty')}</div>
      ) : (
        <ul className="divide-y divide-border bg-surface rounded-md border border-border">
          {combined.map((file) => (
            <li
              key={file.id}
              onClick={() => file.url && window.open(file.url, '_blank')}
              title={file.url ? undefined : t('laboratories.form.noPreview')}
              className={clsx('flex items-center justify-between px-4 py-3', file.url && 'cursor-pointer hover:bg-surface-2')}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-glacier shrink-0" />
                <span className={file.url ? 'text-sm text-glacier hover:underline' : 'text-sm text-text'}>{file.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xs font-mono text-muted">{file.uploadedDate}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletedIds((prev) => new Set(prev).add(file.id));
                  }}
                  className="p-1 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export default function DocumentsTab({ patientId }: { patientId: string }) {
  const { t } = useApp();
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.documents')}</p>
      <StudiesSection patientId={patientId} />
      <FilesSection patientId={patientId} />
    </div>
  );
}
