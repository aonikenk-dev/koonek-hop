import { useRef, useState } from 'react';
import { Upload, FileText, Eye, X, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { AttachmentFile } from '@/data/mock/preoccupational';

interface Props {
  files: AttachmentFile[];
  onChange: (files: AttachmentFile[]) => void;
  accept?: string;
}

async function uploadFile(file: File): Promise<AttachmentFile> {
  const form = new FormData();
  form.append('file', file);
  // apiFetch handles auth header; skip Content-Type so browser sets multipart boundary
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

export default function FileUploader({ files, onChange, accept = '.pdf,.jpg,.jpeg,.png' }: Props) {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(fileList).map(uploadFile));
      onChange([...files, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string) => onChange(files.filter((f) => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 cursor-pointer transition-colors select-none',
          dragging
            ? 'border-moss bg-moss/10 text-moss'
            : uploading
              ? 'border-border text-muted cursor-wait'
              : 'border-border text-muted hover:border-moss/60 hover:text-moss/80',
        ].join(' ')}
      >
        {uploading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Upload size={24} />
        )}
        <p className="text-sm font-mono text-center">
          {uploading ? t('common.fileUpload.uploading') : t('common.fileUpload.dropzone')}
        </p>
        {!uploading && (
          <p className="text-2xs font-mono text-muted">{t('common.fileUpload.formats')}</p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-2xs font-mono text-muted uppercase tracking-widest">
            {t('common.fileUpload.uploaded')}
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 px-3 py-2 rounded border border-border bg-bg"
            >
              <FileText size={15} className="text-muted shrink-0" />
              <span className="flex-1 text-sm font-mono text-text truncate">{file.name}</span>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-moss hover:underline shrink-0"
              >
                <Eye size={12} />
                {t('common.fileUpload.view')}
              </a>
              <button
                onClick={() => removeFile(file.id)}
                className="text-muted hover:text-sienna transition-colors shrink-0"
                title={t('common.fileUpload.remove')}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
