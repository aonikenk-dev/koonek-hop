import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus, Paperclip, X, FileText, Pencil, Loader2 } from 'lucide-react';
import type {
  PreoccupationalExam,
  PreoccupationalAttachment,
  AttachmentFile,
} from '@/data/mock/preoccupational';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface Props {
  exam: PreoccupationalExam;
  onChange: (patch: Partial<PreoccupationalExam>) => void;
}

type AttachmentCategory = PreoccupationalAttachment['category'];

const CATEGORIES: AttachmentCategory[] = [
  'spirometry', 'ecg', 'xray', 'audiometry', 'drugTest', 'lab', 'psycho', 'eeg', 'other',
];

type ModalState =
  | { mode: 'create' }
  | { mode: 'view'; att: PreoccupationalAttachment }
  | { mode: 'edit'; att: PreoccupationalAttachment }
  | null;

interface AttForm {
  description: string;
  category: AttachmentCategory;
  date: string;
  files: AttachmentFile[];
}

function buildForm(source?: PreoccupationalAttachment): AttForm {
  return source
    ? { description: source.description, category: source.category, date: source.uploadedAt, files: source.files }
    : { description: '', category: 'other', date: new Date().toISOString().slice(0, 10), files: [] };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-2xs text-muted tracking-widest uppercase font-mono mb-3 pb-1 border-b border-border">
      {children}
    </h3>
  );
}

async function uploadFile(file: File): Promise<AttachmentFile> {
  const form = new FormData();
  form.append('file', file);
  const token = sessionStorage.getItem('koonek_token');
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json() as Promise<AttachmentFile>;
}

function AttFormFields({
  form,
  setForm,
  t,
}: {
  form: AttForm;
  setForm: React.Dispatch<React.SetStateAction<AttForm>>;
  t: (key: string) => string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFilePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (picked.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(picked.map(uploadFile));
      setForm((f) => ({ ...f, files: [...f.files, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string) =>
    setForm((f) => ({ ...f, files: f.files.filter((file) => file.id !== id) }));

  return (
    <>
      <Input
        label={t('preoccupational.attachments.form.description')}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        required
        placeholder="Ej: Espirometría pre-ingreso con obstrucción leve"
      />

      <Input
        type="date"
        label={t('preoccupational.form.date')}
        value={form.date}
        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        required
      />

      <div className="space-y-1.5">
        <label className="text-2xs font-mono text-muted uppercase tracking-wide">
          {t('preoccupational.attachments.form.category')}
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AttachmentCategory }))}
          className="w-full px-3 py-2.5 bg-surface border border-border rounded font-mono text-sm text-text outline-none focus:border-moss focus:ring-1 focus:ring-moss/20 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`preoccupational.attachments.categories.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-2xs font-mono text-muted uppercase tracking-wide block">
          {t('laboratories.form.files')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {form.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="badge-glacier text-xs hover:underline flex items-center gap-1"
            >
              <Paperclip size={10} />
              {file.name}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); removeFile(file.id); }}
                className="ml-1 hover:text-sienna transition-colors"
              >
                <X size={10} />
              </button>
            </a>
          ))}
        </div>
        <label className={`btn-secondary text-xs inline-flex ${uploading ? 'opacity-60 cursor-wait pointer-events-none' : 'cursor-pointer'}`}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
          {uploading ? t('common.fileUpload.uploading') : t('laboratories.form.attachFile')}
          <input type="file" multiple onChange={(e) => { void handleFilePick(e); }} className="hidden" disabled={uploading} />
        </label>
      </div>
    </>
  );
}

export default function AttachmentsTab({ exam, onChange }: Props) {
  const { t } = useApp();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [form, setForm] = useState<AttForm>(buildForm());

  const openCreate = () => {
    setForm(buildForm());
    setModalState({ mode: 'create' });
  };

  const openView = (att: PreoccupationalAttachment) => {
    setModalState({ mode: 'view', att });
  };

  const openEdit = (att: PreoccupationalAttachment) => {
    setForm(buildForm(att));
    setModalState({ mode: 'edit', att });
  };

  const closeModal = () => {
    setModalState(null);
    setForm(buildForm());
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    const att: PreoccupationalAttachment = {
      id: `att-${Date.now()}`,
      description: form.description,
      category: form.category,
      uploadedAt: form.date,
      files: form.files,
    };
    onChange({ attachments: [...exam.attachments, att] });
    closeModal();
  };

  const handleEdit = (e: FormEvent) => {
    e.preventDefault();
    if (modalState?.mode !== 'edit' || !form.description.trim()) return;
    const updated = exam.attachments.map((a) =>
      a.id === modalState.att.id
        ? { ...a, description: form.description, category: form.category, uploadedAt: form.date, files: form.files }
        : a
    );
    onChange({ attachments: updated });
    closeModal();
  };

  return (
    <div className="space-y-5">
      <section className="bg-surface border border-border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>{t('preoccupational.attachments.sectionTitle')}</SectionTitle>
          <Button variant="secondary" leftIcon={<Plus size={13} />} onClick={openCreate}>
            {t('preoccupational.attachments.addAttachment')}
          </Button>
        </div>

        {exam.attachments.length === 0 ? (
          <p className="text-sm text-muted font-mono py-4 text-center">{t('preoccupational.attachments.empty')}</p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {exam.attachments.map((att) => (
              <li
                key={att.id}
                onClick={() => openView(att)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors"
              >
                <FileText size={14} className="text-ember shrink-0" />
                <span className="flex-1 font-mono text-sm text-text truncate">{att.description}</span>
                <span className="badge-ember shrink-0">
                  {t(`preoccupational.attachments.categories.${att.category}`)}
                </span>
                {att.files.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-moss shrink-0">
                    <Paperclip size={11} /> {att.files.length}
                  </span>
                )}
                <span className="text-xs text-muted shrink-0 font-mono">
                  {new Date(att.uploadedAt).toLocaleDateString('es-AR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create modal */}
      <Modal
        open={modalState?.mode === 'create'}
        onClose={closeModal}
        title={t('preoccupational.attachments.addAttachment')}
        size="sm"
      >
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <AttFormFields form={form} setForm={setForm} t={t} />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" className="text-xs" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="text-xs" disabled={!form.description.trim()}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View modal */}
      {modalState?.mode === 'view' && (
        <Modal
          open
          onClose={closeModal}
          title={modalState.att.description}
          subtitle={t(`preoccupational.attachments.categories.${modalState.att.category}`)}
          size="sm"
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between text-sm font-mono py-1 border-b border-border">
              <span className="text-muted">{t('preoccupational.form.date')}</span>
              <span className="text-text">
                {new Date(modalState.att.uploadedAt).toLocaleDateString('es-AR')}
              </span>
            </div>

            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide mb-2">
                {t('laboratories.form.files')}
              </p>
              {modalState.att.files.length === 0 ? (
                <p className="text-xs text-muted font-mono italic">
                  {t('laboratories.form.noPreview')}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {modalState.att.files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-glacier hover:underline font-mono"
                      >
                        <Paperclip size={12} className="shrink-0" />
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={closeModal}>
                {t('common.close')}
              </Button>
              <Button leftIcon={<Pencil size={13} />} onClick={() => openEdit(modalState.att)}>
                {t('common.edit')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {modalState?.mode === 'edit' && (
        <Modal
          open
          onClose={closeModal}
          title={t('common.edit')}
          subtitle={t(`preoccupational.attachments.categories.${modalState.att.category}`)}
          size="sm"
        >
          <form onSubmit={handleEdit} className="p-5 space-y-4">
            <AttFormFields form={form} setForm={setForm} t={t} />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" className="text-xs" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="text-xs" disabled={!form.description.trim()}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
