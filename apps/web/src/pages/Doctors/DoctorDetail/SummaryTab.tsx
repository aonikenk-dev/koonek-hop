import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { fetchDoctorById } from '@/services/doctors';
import { fetchAppointmentsByDoctorName } from '@/services/appointments';
import { doctorLabel } from '@/data/mock/doctors';
import { getInitials, calculateAge } from '@/utils/format';

interface SummaryTabProps {
  doctorId: string;
}

const LICENSE_TYPE_LABEL: Record<string, string> = {
  mn: 'Mat. Nacional',
  mp: 'Mat. Provincial',
};

export default function SummaryTab({ doctorId }: SummaryTabProps) {
  const { t } = useApp();
  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => fetchDoctorById(doctorId),
  });

  const label = doctor ? doctorLabel(doctor) : '';

  const { data: appointments } = useQuery({
    queryKey: ['doctorAppointments', label],
    queryFn: () => fetchAppointmentsByDoctorName(label),
    enabled: !!label,
  });

  if (isLoading) return <p className="text-sm text-muted">{t('common.loading')}</p>;
  if (!doctor) return <p className="text-sm text-muted">{t('doctors.detail.notFound')}</p>;

  const age = calculateAge(doctor.dateOfBirth);
  const nextAppointment = appointments
    ?.filter((a) => new Date(a.start) > new Date() && a.status !== 'cancelled' && a.status !== 'blocked')
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t('doctors.detail.descriptions.summary')}</p>

      <div className="kpi-card flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center gap-3 sm:w-44 shrink-0">
          <div className="w-24 h-24 rounded-full bg-glacier/20 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-glacier">
              {getInitials(`${doctor.firstName} ${doctor.lastName}`)}
            </span>
          </div>
          <span className={doctor.status === 'active' ? 'badge-moss' : 'badge-muted'}>
            {t(`doctors.statusOptions.${doctor.status}`)}
          </span>
          <p className="text-2xs font-mono text-muted text-center">Cons. {doctor.room}</p>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="font-display font-bold text-xl text-text tracking-tight">{label}</p>
            <p className="text-sm text-muted mt-0.5">{doctor.specialities.join(' · ')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('patients.table.email')}</p>
              <p className="text-sm text-text mt-0.5">{doctor.email || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('patients.table.phone')}</p>
              <p className="text-sm text-text mt-0.5">{doctor.phoneNumber || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('patients.detail.summary.age')}</p>
              <p className="text-sm text-text mt-0.5">{age != null ? `${age}` : '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('doctors.detail.summary.room')}</p>
              <p className="text-sm text-text mt-0.5">Consultorio {doctor.room}</p>
            </div>
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide">{t('doctors.detail.summary.nextAppointment')}</p>
              <p className="text-sm text-text mt-0.5">
                {nextAppointment ? new Date(nextAppointment.start).toLocaleString() : '—'}
              </p>
            </div>
          </div>

          {doctor.licenses.length > 0 && (
            <div>
              <p className="text-2xs font-mono text-muted uppercase tracking-wide mb-2">
                {t('doctors.detail.summary.licenses')}
              </p>
              <div className="flex flex-wrap gap-2">
                {doctor.licenses.map((lic, i) => (
                  <span key={i} className="badge-glacier text-xs">
                    {LICENSE_TYPE_LABEL[lic.licenseType] ?? lic.licenseType} {lic.licenseId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
