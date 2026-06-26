import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  ClipboardList,
  BarChart3,
  Bot,
  Workflow,
  LineChart,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { KoonekIsotipo } from '@/components/ui/KoonekLogo';
import { getInitials } from '@/utils/format';

const NAV_GROUPS = [
  {
    labelKey: 'nav.main',
    items: [{ to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.care',
    items: [
      { to: '/patients', labelKey: 'nav.patients', icon: Users },
      { to: '/appointments', labelKey: 'nav.appointments', icon: CalendarDays },
      { to: '/health-records', labelKey: 'nav.healthRecords', icon: FileText },
      { to: '/prescriptions', labelKey: 'nav.prescriptions', icon: ClipboardList },
      { to: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
    ],
  },
  {
    labelKey: 'nav.ai',
    items: [
      { to: '/ai/copilot', labelKey: 'nav.aiCopilot', icon: Bot },
      { to: '/ai/agents', labelKey: 'nav.aiAgents', icon: Workflow },
      { to: '/ai/insight', labelKey: 'nav.aiInsight', icon: LineChart },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useApp();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen bg-surface border-r border-border transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border min-h-[56px]">
        <div className="shrink-0">
          <KoonekIsotipo size={28} variant="light" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-display font-bold text-md leading-none tracking-tight text-text">Koonek</span>
            <span className="font-mono font-light text-2xs tracking-[.16em] uppercase text-muted truncate mt-0.5">
              HOP
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'ml-auto shrink-0 p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronRight size={14} className={clsx('transition-transform duration-200', !collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map(({ labelKey, items }) => (
          <div key={labelKey}>
            {!collapsed && (
              <p className="px-2 mb-1 text-2xs text-muted tracking-widest uppercase font-mono">{t(labelKey)}</p>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors',
                        collapsed && 'justify-center',
                        isActive ? 'bg-moss/10 text-moss' : 'text-muted hover:bg-surface-2 hover:text-text'
                      )
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate font-mono text-sm">{t(item.labelKey)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border py-3 px-2 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors',
              collapsed && 'justify-center',
              isActive ? 'bg-moss/10 text-moss' : 'text-muted hover:bg-surface-2 hover:text-text'
            )
          }
          title={collapsed ? t('nav.settings') : undefined}
        >
          <Settings size={16} className="shrink-0" />
          {!collapsed && <span className="font-mono text-sm">{t('nav.settings')}</span>}
        </NavLink>

        <div className={clsx('flex items-center gap-2 px-2 py-1.5 rounded group', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-full bg-moss/15 flex items-center justify-center shrink-0">
            <span className="text-2xs font-display font-bold text-moss">
              {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-mono text-text truncate leading-tight">{user?.firstName}</p>
                <p className="text-2xs text-muted truncate leading-tight">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="shrink-0 p-1 rounded text-muted hover:text-sienna hover:bg-sienna/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
