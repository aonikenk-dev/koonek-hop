import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import {
  User,
  CalendarDays,
  IdCard,
  HeartPulse,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  NotebookPen,
  FileText,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { fetchPatientById } from '@/services/patients';
import Button from '@/components/ui/Button';
import SummaryTab from './SummaryTab';
import AppointmentsTab from './AppointmentsTab';
import PersonalDataTab, { type PersonalDataFormValues } from './PersonalDataTab';
import BackgroundTab from './BackgroundTab';
import PrescriptionsTab from './PrescriptionsTab';
import LaboratoriesTab from './LaboratoriesTab';
import DocumentsTab from './DocumentsTab';
import NotesTab from './NotesTab';
import type { HealthBackground } from '@/data/mock/healthBackground';

type InternalTab =
  | 'summary'
  | 'appointments'
  | 'personalData'
  | 'background'
  | 'prescriptions'
  | 'laboratories'
  | 'documents'
  | 'notes';

const TABS: { key: InternalTab; labelKey: string; icon: typeof User }[] = [
  { key: 'summary', labelKey: 'patients.detail.tabs.summary', icon: User },
  { key: 'appointments', labelKey: 'patients.detail.tabs.appointments', icon: CalendarDays },
  { key: 'personalData', labelKey: 'patients.detail.tabs.personalData', icon: IdCard },
  { key: 'background', labelKey: 'patients.detail.tabs.background', icon: HeartPulse },
  { key: 'prescriptions', labelKey: 'patients.detail.tabs.prescriptions', icon: ClipboardList },
  { key: 'laboratories', labelKey: 'patients.detail.tabs.laboratories', icon: FlaskConical },
  { key: 'documents', labelKey: 'patients.detail.tabs.documents', icon: FolderOpen },
  { key: 'notes', labelKey: 'patients.detail.tabs.notes', icon: NotebookPen },
];

export default function PatientDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useApp();
  const { tabs, openTab } = useWorkspaceTabs();
  const [activeTab, setActiveTab] = useState<InternalTab>('summary');

  // Drafts lifted to this parent so they survive switching between internal
  // tabs (which unmount the inactive ones) without losing in-progress edits.
  const [personalDataDraft, setPersonalDataDraft] = useState<PersonalDataFormValues | null>(null);
  const [backgroundDraft, setBackgroundDraft] = useState<HealthBackground | null>(null);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  const { data: patient } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatientById(id),
  });

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
  const patientTabKey = `patient:${id}`;

  // Self-heal: opening this page directly (URL, breadcrumb, browser back)
  // should still show up in the workspace tab bar.
  useEffect(() => {
    if (!tabs.some((tab) => tab.key === patientTabKey)) {
      openTab({
        key: patientTabKey,
        kind: 'patient',
        label: patientName || t('pages.patients.title'),
        path: `/patients/${id}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientTabKey, patientName]);

  const openHealthRecord = () => {
    openTab({
      key: `health-record:${id}`,
      kind: 'healthRecord',
      label: patientName || t('pages.healthRecords.title'),
      path: `/health-records/${id}`,
    });
    navigate(`/health-records/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button leftIcon={<FileText size={14} />} className="text-xs" onClick={openHealthRecord}>
          {t('patients.detail.openHealthRecord')}
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-b-2 -mb-px whitespace-nowrap transition-colors',
              activeTab === tab.key ? 'border-moss text-moss' : 'border-transparent text-muted hover:text-text'
            )}
          >
            <tab.icon size={14} />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'summary' && <SummaryTab patientId={id} patientName={patientName} />}
        {activeTab === 'appointments' && <AppointmentsTab patientName={patientName} />}
        {activeTab === 'personalData' && (
          <PersonalDataTab patientId={id} value={personalDataDraft} onChange={setPersonalDataDraft} />
        )}
        {activeTab === 'background' && (
          <BackgroundTab patientId={id} value={backgroundDraft} onChange={setBackgroundDraft} />
        )}
        {activeTab === 'prescriptions' && <PrescriptionsTab patientId={id} patientName={patientName} />}
        {activeTab === 'laboratories' && <LaboratoriesTab patientId={id} />}
        {activeTab === 'documents' && <DocumentsTab patientId={id} />}
        {activeTab === 'notes' && <NotesTab patientId={id} value={notesDraft} onChange={setNotesDraft} />}
      </div>
    </div>
  );
}
