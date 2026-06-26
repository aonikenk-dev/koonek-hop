import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useApp } from '@/contexts/AppContext';

const PAGE_KEYS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/patients': 'patients',
  '/appointments': 'appointments',
  '/health-records': 'healthRecords',
  '/prescriptions': 'prescriptions',
  '/reports': 'reports',
  '/ai/copilot': 'aiCopilot',
  '/ai/agents': 'aiAgents',
  '/ai/insight': 'aiInsight',
  '/settings': 'settings',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useApp();

  const pageKey = PAGE_KEYS[location.pathname] ?? 'dashboard';
  const title = t(`pages.${pageKey}.title`);
  const subtitle = t(`pages.${pageKey}.subtitle`);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
