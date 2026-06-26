import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }: ConfirmModalProps) {
  const { t } = useApp();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface rounded-lg shadow-card-lg w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
              danger ? 'bg-sienna/10' : 'bg-glacier/10'
            )}
          >
            <AlertTriangle size={16} className={danger ? 'text-sienna' : 'text-glacier'} />
          </div>
          <div>
            {title && <p className="font-display font-semibold text-sm text-text leading-tight">{title}</p>}
            {message && <p className="text-sm text-muted mt-1 leading-snug">{message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel} className="btn-ghost text-xs">
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'btn text-xs px-4 py-2 rounded font-mono font-medium transition-colors',
              danger ? 'bg-sienna text-white hover:bg-sienna-dim' : 'btn-primary'
            )}
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
