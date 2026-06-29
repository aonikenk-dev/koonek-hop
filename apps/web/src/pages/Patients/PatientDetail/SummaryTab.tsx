import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchPatientById } from '@/services/patients';
import { fetchAppointmentsByPatientName } from '@/services/appointments';
import { getInitials, calculateAge } from '@/utils/format';

interface SummaryTabProps {
  patientId: string;
  patientName: string;
}

export default function SummaryTab({ patientId, patientName }: SummaryTabProps) {
  const { t } = useApp();
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatientById(patientId),
  });
  const { data: appointments } = useQuery({
    queryKey: ['patientAppointments', patientName],
    queryFn: () => fetchAppointmentsByPatientName(patientName),
    enabled: !!patientName,
  });

  if (isLoading) return <p className="text-sm text-muted">{t('common.loading')}</p>;
  if (!patient) return <p className="text-sm text-muted">{t('patients.detail.notFound')}</p>;

  const age = calculateAge(patient.dateOfBirth);
  const nextAppointment = appointments
    ?.filter((a) => new Date(a.start) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  const fields: { labelKey: string; value: string }[] = [
    { labelKey: 'patients.detail.summary.age', value: age != null ? `${age}` : '—' },
    { labelKey: 'patients.table.documentId', value: `${patient.nationalIdType} ${patient.documentId}` },
    {
      labelKey: 'patients.detail.summary.healthInsurance',
      value: patient.healthInsurance
        ? `${patient.healthInsurance.companyName} · Plan ${patient.healthInsurance.planCode}`
        : t('patients.detail.summary.particular'),
    },
    { labelKey: 'patients.table.phone', value: patient.phoneNumber },
    { labelKey: 'patients.table.email', value: patient.email },
    { labelKey: 'patients.table.lastVisit', value: patient.lastVisitAt },
    {
      labelKey: 'patients.detail.summary.nextAppointment',
      value: nextAppointment ? new Date(nextAppointment.start).toLocaleString() : '—',
    },
  ];

  if (patient.bloodType) {
    fields.push({
      labelKey: 'patients.detail.summary.bloodType',
      value: `${patient.bloodType}${patient.rhFactor ?? ''}`,
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t('patients.detail.descriptions.summary')}</p>

      <div className="kpi-card flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center gap-3 sm:w-44 shrink-0">
          <div className="w-24 h-24 rounded-full bg-moss/15 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-moss">{getInitials(patientName)}</span>
          </div>
          <span className={patient.status === 'active' ? 'badge-moss' : 'badge-muted'}>
            {t(`patients.statusOptions.${patient.status}`)}
          </span>
          <p className="text-2xs font-mono text-muted text-center">{patient.healthRecordNumber}</p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="font-display font-bold text-xl text-text tracking-tight">{patientName}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.labelKey}>
                <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t(f.labelKey)}</p>
                <p className="text-sm text-text mt-0.5">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
