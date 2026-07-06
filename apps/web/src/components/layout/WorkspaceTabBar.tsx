import type { MouseEvent } from 'react';
import { X, FileText, User, Stethoscope, ClipboardCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspaceTabs, type WorkspaceTab } from '@/store/workspaceTabs';

const KIND_ICON: Record<WorkspaceTab['kind'], typeof FileText> = {
  patient: User,
  healthRecord: FileText,
  doctor: Stethoscope,
  preoccupational: ClipboardCheck,
};

const KIND_ICON_COLOR: Record<WorkspaceTab['kind'], string> = {
  patient: 'text-moss',
  healthRecord: 'text-moss',
  doctor: 'text-glacier',
  preoccupational: 'text-ember',
};

export default function WorkspaceTabBar() {
  const { tabs, activeKey, closeTab, setActiveKey } = useWorkspaceTabs();
  const navigate = useNavigate();
  const location = useLocation();

  if (tabs.length === 0) return null;

  const handleSelect = (key: string, path: string) => {
    setActiveKey(key);
    navigate(path);
  };

  const handleClose = (e: MouseEvent, key: string) => {
    e.stopPropagation();
    const closingActive = key === activeKey;
    const remaining = tabs.filter((t) => t.key !== key);
    closeTab(key);
    if (closingActive) {
      const next = remaining[remaining.length - 1];
      navigate(next ? next.path : '/dashboard');
    }
  };

  return (
    <div className="flex items-center gap-1 px-3 pt-2 bg-surface-2 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.path === location.pathname;
        const Icon = KIND_ICON[tab.kind];
        const iconColor = KIND_ICON_COLOR[tab.kind];
        return (
          <button
            key={tab.key}
            onClick={() => handleSelect(tab.key, tab.path)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-t border-t border-l border-r whitespace-nowrap transition-colors',
              isActive
                ? 'bg-surface border-border text-text -mb-px'
                : 'bg-transparent border-transparent text-muted hover:text-text hover:bg-surface/60'
            )}
          >
            <Icon size={12} className={clsx('shrink-0', iconColor)} />
            {tab.label}
            <span
              onClick={(e) => handleClose(e, tab.key)}
              className="ml-1 p-0.5 rounded hover:bg-border text-muted hover:text-sienna transition-colors"
            >
              <X size={11} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
