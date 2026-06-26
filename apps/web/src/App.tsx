import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Patients from '@/pages/Patients/Patients';
import Appointments from '@/pages/Appointments/Appointments';
import ComingSoon from '@/components/ui/ComingSoon';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function Placeholder({ pageKey }: { pageKey: string }) {
  const { t } = useApp();
  return <ComingSoon title={t(`pages.${pageKey}.title`)} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="health-records" element={<Placeholder pageKey="healthRecords" />} />
        <Route path="prescriptions" element={<Placeholder pageKey="prescriptions" />} />
        <Route path="reports" element={<Placeholder pageKey="reports" />} />
        <Route path="ai/copilot" element={<Placeholder pageKey="aiCopilot" />} />
        <Route path="ai/agents" element={<Placeholder pageKey="aiAgents" />} />
        <Route path="ai/insight" element={<Placeholder pageKey="aiInsight" />} />
        <Route path="settings" element={<Placeholder pageKey="settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
