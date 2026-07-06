import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { User, IdCard, Stethoscope, CalendarDays } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWorkspaceTabs } from '@/store/workspaceTabs';
import { fetchDoctorById } from '@/services/doctors';
import { doctorLabel } from '@/data/mock/doctors';
import SummaryTab from './SummaryTab';
import PersonalDataTab, { type DoctorPersonalDataValues } from './PersonalDataTab';
import ProfessionalTab, { type DoctorProfessionalValues } from './ProfessionalTab';
import AppointmentsTab from './AppointmentsTab';

type InternalTab = 'summary' | 'personalData' | 'professional' | 'appointments';

const TABS: { key: InternalTab; labelKey: string; icon: typeof User }[] = [
  { key: 'summary', labelKey: 'doctors.detail.tabs.summary', icon: User },
  { key: 'personalData', labelKey: 'doctors.detail.tabs.personalData', icon: IdCard },
  { key: 'professional', labelKey: 'doctors.detail.tabs.professional', icon: Stethoscope },
  { key: 'appointments', labelKey: 'doctors.detail.tabs.appointments', icon: CalendarDays },
];

export default function DoctorDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useApp();
  const { tabs, openTab } = useWorkspaceTabs();

  const initialTab = (searchParams.get('tab') as InternalTab | null) ?? 'summary';
  const [activeTab, setActiveTab] = useState<InternalTab>(
    TABS.some((t) => t.key === initialTab) ? initialTab : 'summary'
  );

  const [personalDataDraft, setPersonalDataDraft] = useState<DoctorPersonalDataValues | null>(null);
  const [professionalDraft, setProfessionalDraft] = useState<DoctorProfessionalValues | null>(null);

  const { data: doctor } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => fetchDoctorById(id),
  });

  const label = doctor ? doctorLabel(doctor) : '';
  const doctorTabKey = `doctor:${id}`;

  useEffect(() => {
    if (!tabs.some((tab) => tab.key === doctorTabKey)) {
      openTab({
        key: doctorTabKey,
        kind: 'doctor',
        label: label || t('pages.doctors.title'),
        path: `/doctors/${id}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorTabKey, label]);

  useEffect(() => {
    const param = searchParams.get('tab') as InternalTab | null;
    if (param && TABS.some((t) => t.key === param)) {
      setActiveTab(param);
      navigate(`/doctors/${id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-mono border-b-2 -mb-px whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'border-glacier text-glacier'
                : 'border-transparent text-muted hover:text-text'
            )}
          >
            <tab.icon size={14} />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'summary' && <SummaryTab doctorId={id} />}
        {activeTab === 'personalData' && (
          <PersonalDataTab doctorId={id} value={personalDataDraft} onChange={setPersonalDataDraft} />
        )}
        {activeTab === 'professional' && (
          <ProfessionalTab doctorId={id} value={professionalDraft} onChange={setProfessionalDraft} />
        )}
        {activeTab === 'appointments' && <AppointmentsTab doctorLabel={label} />}
      </div>
    </div>
  );
}
