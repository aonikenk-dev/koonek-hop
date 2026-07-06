import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Doctors from '@/pages/Doctors/Doctors';
import DoctorDetail from '@/pages/Doctors/DoctorDetail';
import Patients from '@/pages/Patients/Patients';
import PatientDetail from '@/pages/Patients/PatientDetail';
import Appointments from '@/pages/Appointments/Appointments';
import Reports from '@/pages/Reports/Reports';
import HealthRecords from '@/pages/HealthRecords/HealthRecords';
import HealthRecordDetail from '@/pages/HealthRecords/HealthRecordDetail';
import Prescriptions from '@/pages/Prescriptions/Prescriptions';
import Copilot from '@/pages/AI/Copilot';
import Agents from '@/pages/AI/Agents';
import Insight from '@/pages/AI/Insight';
import Settings from '@/pages/Settings/Settings';
import Drugs from '@/pages/Catalogues/Drugs';
import HealthInsurances from '@/pages/Catalogues/HealthInsurances';
import StudyTypes from '@/pages/Catalogues/StudyTypes';
import LaboratoryTypes from '@/pages/Catalogues/LaboratoryTypes';
import Services from '@/pages/Catalogues/Services';
import Tags from '@/pages/Catalogues/Tags';
import Preoccupational from '@/pages/Preoccupational/Preoccupational';
import PreoccupationalDetail from '@/pages/Preoccupational/PreoccupationalDetail';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AiRoute({ children }: { children: ReactNode }) {
  const { aiModuleEnabled } = useAI();
  return aiModuleEnabled ? <>{children}</> : <Navigate to="/dashboard" replace />;
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
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="health-records" element={<HealthRecords />} />
        <Route path="health-records/:id" element={<HealthRecordDetail />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="reports" element={<Reports />} />
        <Route
          path="ai/copilot"
          element={
            <AiRoute>
              <Copilot />
            </AiRoute>
          }
        />
        <Route
          path="ai/agents"
          element={
            <AiRoute>
              <Agents />
            </AiRoute>
          }
        />
        <Route
          path="ai/insight"
          element={
            <AiRoute>
              <Insight />
            </AiRoute>
          }
        />
        <Route path="catalogues/drugs" element={<Drugs />} />
        <Route path="catalogues/health-insurances" element={<HealthInsurances />} />
        <Route path="catalogues/study-types" element={<StudyTypes />} />
        <Route path="catalogues/laboratory-types" element={<LaboratoryTypes />} />
        <Route path="catalogues/services" element={<Services />} />
        <Route path="catalogues/tags" element={<Tags />} />
        <Route path="preoccupational" element={<Preoccupational />} />
        <Route path="preoccupational/:id" element={<PreoccupationalDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
