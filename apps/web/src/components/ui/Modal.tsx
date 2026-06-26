import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: Size;
  children: ReactNode;
}

const WIDTH_MAP: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
};

export default function Modal({ open, onClose, title, subtitle, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={clsx(
          'relative w-full bg-surface rounded-lg shadow-card-lg border border-border',
          'flex flex-col max-h-[90dvh]',
          WIDTH_MAP[size]
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            {subtitle && <p className="eyebrow mb-1">{subtitle}</p>}
            {title && <h2 className="font-display font-bold text-lg text-text leading-tight">{title}</h2>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors ml-4 shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
