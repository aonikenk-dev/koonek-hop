import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Breadcrumbs from './Breadcrumbs';
import WorkspaceTabBar from './WorkspaceTabBar';
import LawenWidget from '@/components/ai/LawenWidget';
import { useApp } from '@/contexts/AppContext';
import { patients } from '@/data/mock/patients';

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

function resolveTitle(pathname: string, t: (key: string) => string): { title: string; subtitle: string } {
  const patientDetailMatch = pathname.match(/^\/patients\/([^/]+)$/);
  if (patientDetailMatch) {
    const patient = patients.find((p) => p.id === patientDetailMatch[1]);
    return {
      title: patient ? `${patient.firstName} ${patient.lastName}` : t('pages.patients.title'),
      subtitle: t('pages.patients.title'),
    };
  }

  const healthRecordMatch = pathname.match(/^\/health-records\/([^/]+)$/);
  if (healthRecordMatch) {
    const patient = patients.find((p) => p.id === healthRecordMatch[1]);
    return {
      title: t('pages.healthRecords.title'),
      subtitle: patient ? `${patient.firstName} ${patient.lastName}` : t('pages.healthRecords.subtitle'),
    };
  }

  const pageKey = PAGE_KEYS[pathname] ?? 'dashboard';
  return { title: t(`pages.${pageKey}.title`), subtitle: t(`pages.${pageKey}.subtitle`) };
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useApp();

  const { title, subtitle } = resolveTitle(location.pathname, t);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <Breadcrumbs />
        <WorkspaceTabBar />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
      <LawenWidget />
    </div>
  );
}
